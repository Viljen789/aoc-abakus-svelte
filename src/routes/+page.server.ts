import { AOC_LEADERBOARD_URL, AOC_SESSION_COOKIE } from '$env/static/private';
import { getLatestSnapshot, getSnapshotData, saveSnapshot } from '$lib/server/db.ts';

const convertUnixToDateTime = (timestamp: number | undefined) => {
	const date = new Date(timestamp * 1000);
	return date.toLocaleString();
};

export async function load() {
	let latest = getLatestSnapshot();
	const waitMs = Date.now() - (latest?.fetched_at ? latest.fetched_at * 1000 : 0);
	const waitSStr = new Date(waitMs).toISOString().slice(11, 19);
	const remainingTime = new Date(900000-waitMs).toISOString().slice(11, 19);

	if (!latest || waitMs > 900 * 1000) {
		const response = await fetch(AOC_LEADERBOARD_URL, {
			headers: {
				Cookie: `session=${AOC_SESSION_COOKIE}`
			}
		});
		const data = await response.json();
		saveSnapshot(data, data.event);
		console.log('Fetched data');

		latest = getLatestSnapshot();
	} else {
		console.log('Too frequent. Fetching data from: ');
		latest = getLatestSnapshot();
		console.log('fetched at: ', convertUnixToDateTime(latest?.fetched_at));
		console.log('Will not fetch for another: ',remainingTime , 'Current wait: (s):', waitSStr );
		console.log('Snapshot: ', latest?.id);
	}

	if (!latest) {
		console.error('No snapshot available');
		return { members: {}, event: '2024' };
	}

	const result = getSnapshotData(latest.id);

	return result;
}
