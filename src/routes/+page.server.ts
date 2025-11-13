import { AOC_LEADERBOARD_URL, AOC_SESSION_COOKIE } from '$env/static/private';
import {
	getLatestSnapshot,
	getSnapshotData,
	saveSnapshot,
	firstDay,
	getOldRanks
} from '$lib/server/db.ts';
import { convertUnixToDateTime } from '$lib/utils/time.ts';

export async function load({ locals }) {
	let latest = getLatestSnapshot();
	const waitMs = Date.now() - (latest?.fetched_at ? latest.fetched_at * 1000 : 0);
	const waitSStr = new Date(waitMs).toISOString().slice(11, 19);
	const remainingTime = new Date(900000 - waitMs).toISOString().slice(11, 19);
	const dayInMs: number = 24 * 60 * 60; // Seconds since db is in secs
	const startOfToday: number = Math.floor(new Date() / (dayInMs * 1000)) * dayInMs; // Convert from ms to secs

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

	return {
		...result,
		user: locals.user,
		firstDay: day,
		diffRanks
	};
}
