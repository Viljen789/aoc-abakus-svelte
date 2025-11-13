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

export async function load({ locals }) {
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

  return {
    ...result,
    user: locals.user,
    firstDay: day,
    diffRanks
  };
}