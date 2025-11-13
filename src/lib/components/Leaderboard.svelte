<script lang="ts">
	import {
		X,
		Check,
		CheckCheck,
		CalendarClock,
		ArrowUpFromDot,
		Minus,
		ArrowDownToDot,
		Hourglass
	} from 'lucide-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { flip } from 'svelte/animate';
	import tippy from 'tippy.js';
	import DynamicClock from '$lib/components/DynamicClock.svelte';
	import { changeTime, convertUnixToDateTime, timeDiffObj } from '$lib/utils/time.ts';

	const { data = {}, members = {}, event = '2024', recentStars = [] } = $props();

	const sortedMembers = Object.values(members).sort((a, b) => b.local_score - a.local_score);
	const currentYear = parseInt(event);
	const now = Date.now() / 1000; // get seconds

	// const firstDay = data.firstDay;
	// const currentDay = timeDiff(now, firstDay).d;
	const firstDay: number = 1763006400;
	const currentDay: number = 1;

	const nextDay = changeTime({ originalTime: firstDay, d: currentDay });
	console.log('nd: ', nextDay);
	console.log('unix:', convertUnixToDateTime(nextDay));

	console.log('first:', convertUnixToDateTime(firstDay, true));
	console.log('next: ', convertUnixToDateTime(nextDay, true));
	console.log(Date.now());
	// const nextDayProgress = (nextDay-Date.now()/1000)/(24*60*60);
	const nextDayProgress = 0.1;
	console.log('nextDayProgress:', nextDayProgress);

	const getDayStatus = (member: member, day: number) => {
		const dayData = member.completion_day_level[day];
		if (!dayData) return 'none';
		if (dayData['2']) return 'both';
		if (dayData['1']) return 'one';
	};

	const recentStarsSet = new Set(recentStars.map((s) => `${s.member_id}-${s.day}-${s.part}`));

	const isStarRecent = (memberId: number, day: number, part: number) => {
		return recentStarsSet.has(`${memberId}-${day}-${part}`);
	};

	let displayMembers = $state<any[]>([]);

	const oldRanks = (data.diffRanks || {}) as Record<string, number>;

	const sortedByOldRank = [...sortedMembers].sort((a, b) => {
		const rankA = oldRanks[String(a.id)] ?? 999;
		const rankB = oldRanks[String(b.id)] ?? 999;
		return rankA - rankB;
	});
	displayMembers = sortedByOldRank;

	$effect(() => {
		setTimeout(() => {
			displayMembers = sortedMembers;
		}, 100);
	});

	let diff = new SvelteMap<number, number>();
	for (let i = 0; i < sortedMembers.length; i++) {
		const currentRank = i + 1;
		const previousRank = oldRanks[String(sortedMembers[i].id)] ?? currentRank;
		diff.set(sortedMembers[i].id, previousRank - currentRank);
	}
	console.log(diff);
</script>

<div>
	<div>
		<table class="w-full border-collapse">
			<thead>
			<tr class="">
				<th class="w-0.5 text-center"></th>
				<th class="w-fit p-2 text-center">Rank</th>
				<th class="p-2 text-left">Navn</th>
				<th class="w-fit p-2 text-center">Stjerner</th>
				<th class="p-2 text-center">Score</th>

				{#each Array.from({ length: 25 }, (_, i) => i + 1) as day (day)}
					<th
						class="w-8 p-2 text-center text-sm transition-all duration-1000"
						style={day === currentDay + 1
								? `opacity: ${0.3 + nextDayProgress * 0.7};
						     background: linear-gradient(90deg, transparent, rgba(100, 100, 100, 0.4));`
								: day > currentDay
									? 'background-color: rgb(100, 100, 100); opacity: 0.3;'
									: ''}
					>
						{#if day > currentDay + 1}
							<CalendarClock />
						{:else if day === currentDay + 1}
								<span
									class="icon-wrap hg-flip"
									aria-hidden="true"
									use:tippy={{ content: 'Test', placement: 'bottom' }}
								>
									<Hourglass class="hg-flip" width="20" height="20" />
								</span>
						{:else}
							<a href={`https://adventofcode.com/${currentYear}/day/${day}`} class="text-blue-300"
							>{day}</a
							>
						{/if}
					</th>
				{/each}
			</tr>
			</thead>
			<tbody>
			{#each displayMembers as member, i (member.id)}
				{@const change = diff.get(member.id)}
				<tr
					class="text-center transition-colors odd:bg-slate-100 hover:bg-slate-300"
					animate:flip
				>
					<td class=" text-center">
						{#if change > 0}
							<div class="text-center text-green-600">
								<ArrowUpFromDot />
								+{change}
							</div>
						{:else if change < 0}
							<div class="text-red-600">
								<ArrowDownToDot />
								{change}
							</div>
						{:else}
							<div>
								<Minus />
							</div>
						{/if}
					</td>
					<td class="p-2 text-center">{i + 1}</td>
					<td class="p-2 text-left">{member.name || 'Anonymous'}</td>
					<td class="p-2 text-center">{member.stars}</td>
					<td class="p-2 text-center">{member.local_score}</td>
					{#each Array.from({ length: 25 }, (_, i) => i + 1) as day (day)}
						{@const status = getDayStatus(member, day)}
						<td
							animate:flip
							class="p-1 text-center transition-all duration-1000"
							style={day === currentDay + 1
									? `opacity: ${0.3 + nextDayProgress * 0.7};
						     background: linear-gradient(90deg, transparent, rgba(100, 100, 100, 0.4));`
									: day > currentDay
										? 'background-color: rgb(100, 100, 100); opacity: 0.3;'
										: ''}
						>
							{#if status === 'none' && day <= currentDay}
								-
							{:else if status === 'both' && day <= currentDay}
								<CheckCheck
									class="text-center text-2xl text-yellow-500 {isStarRecent(member.id, day, 2)
											? 'shimmer'
											: ''}"
								/>
							{:else if status === 'one' && day <= currentDay}
								<Check
									class="text-2xl text-slate-400 {isStarRecent(member.id, day, 1)
											? 'shimmer'
											: ''}"
								/>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
</div>
1763049041.054 1733029200

<style>
    .icon-wrap {
        display: inline-block;
    }

    .hg-flip {
        display: inline-block;
        transform-box: fill-box;
        transform-origin: center;
        transform-style: preserve-3d;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        will-change: transform;
        animation: hg-flip 4s ease-in-out infinite;
    }

    @keyframes hg-flip {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
