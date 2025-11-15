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

/**
 * Calculates the current AoC day based on EST timezone (UTC-5)
 * AoC puzzles unlock at midnight EST (5:00 UTC)
 * Returns the day number (1-25) or 0 if before December 1st
 */
function getCurrentAoCDay(eventYear: number): number {
	const now = new Date();

	// Create midnight EST for December 1st of the event year
	// Midnight EST = 5:00 UTC
	const dec1MidnightEST = new Date(Date.UTC(eventYear, 11, 1, 5, 0, 0));

	if (now < dec1MidnightEST) {
		return 0; // Event hasn't started yet
	}

	// Calculate how many days have passed since Dec 1st at midnight EST
	const timeSinceStart = now.getTime() - dec1MidnightEST.getTime();
	const daysSinceStart = Math.floor(timeSinceStart / (1000 * 60 * 60 * 24));

	// AoC runs from day 1-25
	return Math.min(daysSinceStart + 1, 25);
}

/**
 * Checks if we need to fetch new data based on AoC schedule
 * Returns true if:
 * - No data exists
 * - More than 15 minutes have passed (normal cache)
 * - We've crossed into a new AoC day and haven't fetched yet
 */
function shouldFetchData(latest: any, eventYear: number): boolean {
	if (!latest) return true;

	const now = Date.now();
	const lastFetchTime = latest.fetched_at * 1000;
	const timeSinceLastFetch = now - lastFetchTime;

	// Always respect the 15-minute cache to avoid hitting AoC API too frequently
	if (timeSinceLastFetch < 900000) {
		return false;
	}

	// Get current AoC day
	const currentAoCDay = getCurrentAoCDay(eventYear);

	if (currentAoCDay === 0) {
		// Event hasn't started, use normal cache
		return timeSinceLastFetch > 900000;
	}

	// Check if the last fetch was before the current AoC day started
	const currentDayStartEST = new Date(Date.UTC(eventYear, 11, currentAoCDay, 5, 0, 0));

	if (lastFetchTime < currentDayStartEST.getTime()) {
		console.log(`New AoC day ${currentAoCDay} detected, fetching fresh data`);
		return true;
	}

	return timeSinceLastFetch > 900000;
}

export async function load({ locals }: { locals: App.Locals }) {
	console.log('\n+page.server.ts load() called');
	console.log('  locals.user:', locals.user);
	console.log('  locals.accessToken:', locals.accessToken ? 'present' : 'missing');

	let latest = getLatestSnapshot();
	const waitMs = Date.now() - (latest?.fetched_at ? latest.fetched_at * 1000 : 0);
	const waitSStr = new Date(waitMs).toISOString().slice(11, 19);
	const remainingTime = new Date(900000 - waitMs).toISOString().slice(11, 19);

	const secondsPerDay = 86400;
	const startOfToday = Math.floor(Date.now() / 1000 / secondsPerDay) * secondsPerDay;

	// Determine event year from latest snapshot or default to current year
	const eventYear = latest?.event ? parseInt(latest.event) : new Date().getFullYear();
	const currentAoCDay = getCurrentAoCDay(eventYear);
	console.log(`Current AoC day: ${currentAoCDay}`);

	if (shouldFetchData(latest, eventYear)) {
		const response = await fetch(AOC_LEADERBOARD_URL, {
			headers: { Cookie: `session=${AOC_SESSION_COOKIE}` }
		});
		const data = await response.json();
		saveSnapshot(data, data.event, data.day1_ts);
		console.log('Fetched data');
		latest = getLatestSnapshot();
	} else {
		console.log('Too frequent. Fetching data from: ');
		latest = getLatestSnapshot();
		console.log('fetched at: ', convertUnixToDateTime(latest?.fetched_at));
		console.log('Will not fetch for another: ', remainingTime, 'Current wait (s):', waitSStr);
		console.log('Snapshot: ', latest?.id);
	}

	if (!latest) {
		console.error('No snapshot available');
		return { members: {}, event: '2024', user: locals.user };
	}

	const result = getSnapshotData(latest.id);
	const day = firstDay();
	const diffRanks = getOldRanks(startOfToday);

	let abakusUsers: MinimalAbakusUser[] = [];
	if (locals.accessToken) {
		try {
			abakusUsers = await fetchAllUsers(locals.accessToken);
		} catch {}
	}

	const githubToAbakusUser = new Map<string, MinimalAbakusUser>();
	for (const u of abakusUsers) {
		if (u.githubUsername) githubToAbakusUser.set(u.githubUsername.toLowerCase(), u);
	}

	const enrichedMembers: Record<string, any> = { ...result.members };
	for (const [memberId, member] of Object.entries(enrichedMembers)) {
		if (member.name) {
			const abakusUser = githubToAbakusUser.get(member.name.toLowerCase());
			if (abakusUser) {
				enrichedMembers[memberId] = { ...member, abakusUser };
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
