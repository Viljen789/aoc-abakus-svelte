export const timeDiff = (start: number, end: number) => {
	const ms = end - start;
	const dc = 24 * 60 * 60 * 1000;
	const hc = dc / 24;
	const mc = hc / 60;
	const sc = mc / 60;
	const dInMs = Math.floor(ms / dc);
	const hInMs = Math.floor((ms - dc * dInMs) / hc);
	const mInMs = Math.floor((ms - hc * hInMs - dc * dInMs) / mc);
	const sInMs = Math.floor((ms - mc * mInMs - hc * hInMs - dc * dInMs) / sc);
	return { d: dInMs, h: hInMs, m: mInMs, s: sInMs };
};

export const diffToFormat = (diff: object) =>
	`${diff.d.toString().padStart(2, '0')}:${diff.h.toString().padStart(2, '0')}:${diff.m.toString().padStart(2, '0')}:${diff.s.toString().padStart(2, '0')}`;

export const formattedDiff = (start: number, end: number) => diffToFormat(timeDiff(start, end));
