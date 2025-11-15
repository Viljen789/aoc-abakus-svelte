<script lang="ts">
	import Statistics from '$lib/components/Stats/Statistics.svelte';
	import { formattedDiff, SecsToDHMS, startCountdown, countdownTime } from '$lib/utils/time.ts';
	import DynamicClock from '$lib/components/DynamicClock.svelte';
	import Streak from '$lib/components/PersonalBar/Streak.svelte';
	import Completion from '$lib/components/PersonalBar/Completion.svelte';
	import MissingDays from '$lib/components/PersonalBar/MissingDays.svelte';
	import type { member } from '$lib/server/db';
	import LinkGithub from '$lib/components/PersonalBar/LinkGithub.svelte';

	const { data = {}, members = {}, event = '2024' } = $props();
	const targetDate = 1761951600;
	$effect(() => {
		if (typeof window !== 'undefined') startCountdown(targetDate);
	});

	// Find the current user's AoC member data
	const currentUserMember: member | null = $derived.by(() => {
		if (!data.user?.githubUsername) return null;

		const githubUsername = data.user.githubUsername.toLowerCase();

		for (const member of Object.values(members) as member[]) {
			if (member.name?.toLowerCase() === githubUsername) {
				return member;
			}
		}

		return null;
	});

	// Calculate current day of AoC (1-25)
	const currentDay = $derived.by(() => {
		const firstDay = data.firstDay
			? data.firstDay * 1000
			: new Date(parseInt(event), 11, 1).getTime();
		const now = Date.now();
		const daysPassed = Math.floor((now - firstDay) / (1000 * 60 * 60 * 24));
		return Math.min(Math.max(daysPassed + 1, 1), 25);
	});

	// Calculate streak - consecutive days with at least one star
	const streak = $derived.by(() => {
		if (!currentUserMember) return 0;

		let currentStreak = 0;
		const completionDays = currentUserMember.completion_day_level;

		// Start from current day and go backwards
		for (let day = currentDay; day >= 1; day--) {
			if (completionDays[day] && (completionDays[day]['1'] || completionDays[day]['2'])) {
				currentStreak++;
			} else {
				break;
			}
		}

		return currentStreak;
	});

	// Calculate solved problems (total stars)
	const solved = $derived(currentUserMember?.stars ?? 0);

	// Total problems available so far (2 per day)
	const totalProblems = $derived(currentDay * 2);

	// Calculate missing days
	const missingDays = $derived.by(() => {
		if (!currentUserMember) return [];

		const missing: number[] = [];
		const completionDays = currentUserMember.completion_day_level;

		for (let day = 1; day <= currentDay; day++) {
			const dayData = completionDays[day];
			// Day is missing if it has no stars at all
			if (!dayData || (!dayData['1'] && !dayData['2'])) {
				missing.push(day);
			}
		}

		return missing;
	});

	const currentYear = parseInt(event);
	const percentage = $derived(Math.round((solved / totalProblems) * 100));
	const exampleAvgTime = 1000000; //Example in s
</script>

<div>
	{#if currentUserMember}
		<div class="m-6 flex justify-around gap-4 rounded-lg bg-gray-100 p-4 shadow-md">
			<div class="flex-1">
				<Streak {streak} />
			</div>

			<div class="flex-1 rounded-lg shadow-md">
				<Completion {solved} {totalProblems} />
			</div>

			<div class="flex flex-1 justify-around rounded-lg bg-white p-4 shadow-md">
				<MissingDays {missingDays} />
			</div>
			<!--<div class="flex-1 flex justify-around bg-white p-4 rounded-lg shadow-md">
				Gjennomsnittlig tid: {formattedDiff(0, exampleAvgTime)};
				&lt;!&ndash;			<DynamicClock countdown={$countdownTime}/>&ndash;&gt;
			</div>-->
		</div>
	{:else}
		<LinkGithub {data} />
	{/if}
</div>

<style>
	button:hover {
		background-color: #d35400;
	}
</style>
