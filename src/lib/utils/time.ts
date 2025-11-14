import { writable } from 'svelte/store';

export const timeDiffObj = (start: number, end: number) => {
	const s = end - start;
	const dc = 24 * 60 * 60;
	const hc = dc / 24;
	const mc = hc / 60;
	const sc = mc / 60;
	const dInMs = Math.floor(s / dc);
	const hInMs = Math.floor((s - dc * dInMs) / hc);
	const mInMs = Math.floor((s - hc * hInMs - dc * dInMs) / mc);
	const sInMs = Math.floor((s - mc * mInMs - hc * hInMs - dc * dInMs) / sc);
	return { d: dInMs, h: hInMs, m: mInMs, s: sInMs };
};

export const diffToFormat = (diff: { d: number; h: number; m: number; s: number }) =>
	`${diff.d.toString().padStart(2, '0')}:${diff.h.toString().padStart(2, '0')}:${diff.m
		.toString()
		.padStart(2, '0')}:${diff.s.toString().padStart(2, '0')}`;

export const formattedDiff = (start: number, end: number) => diffToFormat(timeDiffObj(start, end));

export const convertUnixToDateTime = (timestamp: number | undefined, timeInS: boolean = true) => {
	const date = new Date(timestamp * (timeInS ? 1000 : 1));
	return date.toLocaleString();
};

export const changeTime = ({ originalTime = Date.now() / 1000, d = 0, h = 0, m = 0, s = 0 }) => {
	const dc = 24 * 60 * 60;
	const hc = dc / 24;
	const mc = hc / 60;
	const sc = mc / 60;
	return originalTime + d * dc + h * hc + m * mc + s * sc;
};

export const SecsToDHMS = (secs: number) => {
	return timeDiffObj(0, secs);
};

const countdownTime = writable('calculating...');
let interval: ReturnType<typeof setInterval> | null = null;

export function startCountdown(targetDate: number) {
	stopCountdown();
	const tick = () => {
		countdownTime.set(formattedDiff(Date.now(), targetDate));
	};
	tick();
	interval = setInterval(tick, 1000);
}

export function stopCountdown() {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
}

export { countdownTime };
