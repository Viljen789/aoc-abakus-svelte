// File: src/routes/%2Bpage.server.ts
import { AOC_LEADERBOARD_URL, AOC_SESSION_COOKIE } from '$env/static/private';
import {
	getLatestSnapshot,
	getSnapshotData,
	saveSnapshot,
	firstDay,
	getOldRanks
} from '$lib/server/db.ts';
import { convertUnixToDateTime } from '$lib/utils/time.ts';
import { fetchAllUsers, type MinimalAbakusUser } from '$lib/server/auth.ts';

export async function load({ locals }: { locals: App.Locals }) {
	console.log('\n+page.server.ts load() called');
	console.log('  locals.user:', locals.user);
	console.log('  locals.accessToken:', locals.accessToken ? 'present' : 'missing');

	let latest = getLatestSnapshot();
	const waitMs = Date.now() - (latest?.fetched_at ? latest.fetched_at * 1000 : 0);
	const waitSStr = new Date(waitMs).toISOString().slice(11, 19);
	const remainingTime = new Date(900000 - waitMs).toISOString().slice(11, 19);

	const secondsPerDay = 24 * 60 * 60; //  secs in a day
	const startOfToday = Math.floor(Date.now() / 1000 / secondsPerDay) * secondsPerDay;

	if (!latest || waitMs > 900 * 1000) {
		const response = await fetch(AOC_LEADERBOARD_URL, {
			headers: {
				Cookie: `session=${AOC_SESSION_COOKIE}`
			}
		});
		const data = await response.json();
		saveSnapshot(data, data.event, data.day1_ts);
		console.log('Fetched data');

		latest = getLatestSnapshot();
	} else {
		console.log('Too frequent. Fetching data from: ');
		latest = getLatestSnapshot();
		console.log('fetched at: ', convertUnixToDateTime(latest?.fetched_at));
		console.log('Will not fetch for another: ', remainingTime, 'Current wait: (s):', waitSStr);
		console.log('Snapshot: ', latest?.id);
	}

	if (!latest) {
		console.error('No snapshot available');
		return { members: {}, event: '2024', user: locals.user };
	}

	const result = getSnapshotData(latest.id);
	const day = firstDay();
	const diffRanks = getOldRanks(startOfToday);

	// Fetch Abakus users and match with AOC members
	let abakusUsers: MinimalAbakusUser[] = [];
	if (locals.accessToken) {
		try {
			abakusUsers = await fetchAllUsers(locals.accessToken);
			console.log(`\n${'='.repeat(60)}`);
			console.log(`Fetched ${abakusUsers.length} Abakus users:`);
			console.log('='.repeat(60));

			// Log all fetched users
			abakusUsers.forEach((user, index) => {
				const fullName = (user.fullName || '(no name)').padEnd(30);
				const username = (user.username || '(no username)').padEnd(15);
				const github = user.githubUsername || '(none)';
				console.log(
					`${(index + 1).toString().padStart(2)}. ${fullName} @${username} GitHub: ${github}`
				);
			});
			console.log('='.repeat(60) + '\n');
		} catch (error) {
			console.error('Failed to fetch Abakus users:', error);
		}
	}

	// Create a mapping of GitHub username (lowercase) to Abakus user
	const githubToAbakusUser = new Map<string, MinimalAbakusUser>();
	let usersWithGithub = 0;
	for (const abakusUser of abakusUsers) {
		if (abakusUser.githubUsername) {
			githubToAbakusUser.set(abakusUser.githubUsername.toLowerCase(), abakusUser);
			usersWithGithub++;
		}
	}
	console.log(`${usersWithGithub} users have GitHub usernames set\n`);

	// Enrich AOC members with Abakus user data
	const enrichedMembers = { ...result.members };
	for (const [memberId, member] of Object.entries(enrichedMembers)) {
		if (member.name) {
			const aocUsername = member.name.toLowerCase();
			const abakusUser = githubToAbakusUser.get(aocUsername);
			if (abakusUser) {
				enrichedMembers[memberId] = {
					...member,
					abakusUser
				};
				console.log(`Matched AOC user "${member.name}" with Abakus user "${abakusUser.fullName}"`);
			}
		}
	}

	return {
		members: enrichedMembers,
		event: result.event,
		user: locals.user,
		firstDay: day,
		diffRanks
	};
}
