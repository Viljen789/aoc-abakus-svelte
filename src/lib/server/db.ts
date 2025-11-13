import Database from 'better-sqlite3';

export interface member {
	id: number;
	name: string;
	stars: number;
	local_score: number;
	last_star_ts: number;
	completion_day_level: {
		[day: string]: {
			'1'?: { get_star_ts: number };
			'2'?: { get_star_ts: number };
		};
	};
}
export interface LeaderboardData {
	members: { [id: string]: member };
	event: string;
}
const db = new Database('leaderboard.db');

const initDatabase = () => {
	db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fetched_at INTEGER NOT NULL,
      event TEXT NOT NULL,
			day1_ts INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS member_snapshots (
      snapshot_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      name TEXT,
      stars INTEGER NOT NULL,
      local_score INTEGER NOT NULL,
      last_star_ts INTEGER,
      FOREIGN KEY (snapshot_id) REFERENCES snapshots(id),
      UNIQUE(snapshot_id, member_id)
    );

    CREATE TABLE IF NOT EXISTS star_completions (
      snapshot_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      day INTEGER NOT NULL,
      part INTEGER NOT NULL,
      completed_at INTEGER NOT NULL,
      FOREIGN KEY (snapshot_id) REFERENCES snapshots(id),
      UNIQUE(snapshot_id, member_id, day, part)
    );
  `);
};

initDatabase();

export const getLatestSnapshot = () => {
	const stmt = db.prepare(`
    SELECT id, fetched_at, event, day1_ts
    FROM snapshots 
    ORDER BY fetched_at DESC 
    LIMIT 1
  `);

	return stmt.get() as { id: number; fetched_at: number; event: string; day1_ts: number };
};

export const getSnapshotHistory = (limit: number = 100) => {
	const stmt = db.prepare(`
    SELECT id, fetched_at, event 
    FROM snapshots 
    ORDER BY fetched_at DESC 
    LIMIT ?
  `);

	return stmt.all(limit);
};

export const getMemberFromSnapshot = (snapshot_id: number, member_id: number) => {
	const stmt = db.prepare(`
		SELECT member_id, name, stars, local_score, last_star_ts
		FROM member_snapshots
		WHERE snapshot_id = ? AND member_id = ?
	`);

	return stmt.get(snapshot_id, member_id);
};
export const saveSnapshot = (data: LeaderboardData, event: string, day1_ts: number) => {
	const snapshotStmt = db.prepare(`
		INSERT INTO snapshots (fetched_at, event, day1_ts)
		VALUES (?, ?, ?)
	`);
	const result = snapshotStmt.run(Date.now() / 1000, event, day1_ts);
	const snapshotId = result.lastInsertRowid;

	const memberStmt = db.prepare(`
		INSERT INTO member_snapshots (snapshot_id, member_id, name, stars, local_score, last_star_ts)
		VALUES (?, ?, ?, ?, ?, ?)
	`);

	const starStmt = db.prepare(`
  INSERT INTO star_completions (snapshot_id, member_id, day, part, completed_at)
  VALUES (?, ?, ?, ?, ?)
`);

	for (const [memberId, member] of Object.entries(data.members)) {
		memberStmt.run(
			snapshotId,
			memberId,
			member.name,
			member.stars,
			member.local_score,
			member.last_star_ts
		);

		for (const [day, parts] of Object.entries(member.completion_day_level)) {
			for (const [part, completion] of Object.entries(parts)) {
				starStmt.run(snapshotId, memberId, day, part, completion.get_star_ts);
			}
		}
	}
	return snapshotId;
};

export const getAllMembersForSnapshot = (snapshotId: number) => {
	const stmt = db.prepare(`
		SELECT member_id, name, stars, local_score, last_star_ts
		FROM member_snapshots
		WHERE snapshot_id = ?
	`);
	return stmt.all(snapshotId) as Array<{
		member_id: number;
		name: string;
		stars: number;
		local_score: number;
		last_star_ts: number;
	}>;
};

export const getAllStarsForSnapshot = (snapshotId: number) => {
	const stmt = db.prepare(`
		SELECT member_id, day, part, completed_at
		FROM star_completions
		WHERE snapshot_id = ?
	`);
	return stmt.all(snapshotId) as Array<{
		member_id: number;
		day: number;
		part: number;
		completed_at: number;
	}>;
};

export const getSnapshotData = (snapshot_id: number): LeaderboardData => {
	const members = getAllMembersForSnapshot(snapshot_id);
	const stars = getAllStarsForSnapshot(snapshot_id);

	const snapshot = db.prepare('SELECT event FROM snapshots WHERE id = ?').get(snapshot_id) as {
		event: string;
	};

	const membersMap: { [id: string]: member } = {};

	for (const m of members) {
		membersMap[m.member_id] = {
			id: m.member_id,
			name: m.name,
			stars: m.stars,
			local_score: m.local_score,
			last_star_ts: m.last_star_ts,
			completion_day_level: {}
		};
	}

	for (const star of stars) {
		const member = membersMap[star.member_id];
		if (!member) continue;

		if (!member.completion_day_level[star.day]) {
			member.completion_day_level[star.day] = {};
		}

		member.completion_day_level[star.day][star.part] = {
			get_star_ts: star.completed_at
		};
	}

	return {
		members: membersMap,
		event: snapshot?.event || '2024'
	};
};

export const getRecentStars = (secondsAgo: number, snapshot_id: number) => {
	const nowInSeconds = Math.floor(Date.now() / 1000);
	const cutoffTime = nowInSeconds - secondsAgo;
	const recentStars = db.prepare(`
        SELECT member_id, part, day 
        FROM star_completions 
        WHERE completed_at > ?
        AND snapshot_id = ?
    `);
	return recentStars.all(cutoffTime, snapshot_id) as Array<{
		member_id: number;
		part: number;
		day: number;
	}>;
};

export const firstDay = (): number | undefined => {
	const stmt = db.prepare(`
    SELECT day1_ts
    FROM snapshots
    ORDER BY snapshots.fetched_at DESC LIMIT 1
  `);
	const row = stmt.get() as { day1_ts?: number } | undefined;
	return row?.day1_ts;
};

export const getOldRanks = (dayStart: number) => {
	const firstStmt = db.prepare(`
		SELECT id
		FROM snapshots
		WHERE fetched_at <= ?
		ORDER BY fetched_at DESC;
	`);
	const leaderboardId = firstStmt.get(dayStart) as number;

	const stmt = db.prepare(`

        SELECT 
            member_id,
            ROW_NUMBER() OVER (ORDER BY local_score DESC) as rank
        FROM member_snapshots
        WHERE snapshot_id = ?
    `);

	const rows = stmt.all(leaderboardId.id) as Array<{
		member_id: number;
		rank: number;
	}>;

	const rankMap = new Map();
	for (const row of rows) {
		rankMap.set(row.member_id, row.rank);
	}

	return rankMap;
};
