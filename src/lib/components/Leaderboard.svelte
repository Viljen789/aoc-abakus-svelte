<script lang="ts">
	import { X, Check, CheckCheck, CalendarClock, ArrowUpFromDot, Minus, ArrowDownToDot } from 'lucide-svelte';
	import { type member } from '$lib/server/db.ts';
	import { SvelteMap } from 'svelte/reactivity';
	// import {getOldLeaderboardId} from '$lib/server/db.ts';


	const { data = {}, members = {}, event = '2024', recentStars = [] } = $props();

	const sortedMembers = Object.values(members).sort((a, b) => b.local_score - a.local_score);
	const currentYear = parseInt(event);
	const currentDay = 14;


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

	const recent = data.newList.sort((a, b) => a.local_score - b.local_score);
	const prev = data?.oldList.sort((a, b) => a.local_score - b.local_score);
	let oldMap = new SvelteMap();
	for (let i = 0; i < prev.length; i++) {
		oldMap.set(prev[i].member_id, i);
	}

	let diff = new SvelteMap();

	for (let i = 0; i < recent.length; i++) {
		diff.set(recent[i].member_id, i - oldMap.get(recent[i].member_id));
	}
	console.log(diff);
</script>

<div>
	<div>
		<table class="w-full, border-collapse">
			<thead>
			<tr class="">
				<th class=" text-right"></th>
				<th class="p-2 text-right">Rank</th>
				<th class="p-2 text-left">Navn</th>
				<th class="p-2 text-center">Stjerner</th>
				<th class="p-2 text-center">Score</th>

				<!--				 eslint-disable-next-line svelte/require-each-key -->
				{#each Array.from({ length: 25 }, (_, i) => i + 1) as day, i (day)}
					<th
						class="text-sm, w-8 p-2 text-center"
						style={day > currentDay ? 'background-color: gray;' : ''}
					>
						{#if day <= currentDay}
							<a href={`https://adventofcode.com/${currentYear}/day/${day}`} class="text-blue-300"
							>{day}</a
							>
						{:else}
							<CalendarClock />
						{/if}
					</th>
				{/each}
			</tr>
			</thead>
			<tbody>
			{#each sortedMembers as member, i (member.id)}
				{@const change = diff.get(member.id)}
				<tr class="nth-last-of-type-[-n+3]:">
					<td class="p-1 text-center ">
						{#if change > 0 }
							<div class="text-green-600">
								<ArrowUpFromDot /> +{change}
							</div>
						{:else if change < 0}
							<div class="text-red-600">
								<ArrowDownToDot/>
								{change}
							</div>
						{:else }
							<div>
								<Minus />
							</div>
						{/if}
					</td>
					<td class="p-2 text-center">{i + 1}</td>
					<td class="p-2 text-ce">{member.name || 'Anonymous'}</td>
					<td class="p-2 text-center">{member.stars}</td>
					<td class="p-2 text-center">{member.local_score}</td>
					{#each Array.from({ length: 25 }, (_, i) => i + 1) as day, i (day)}
						{@const status = getDayStatus(member, day)}
						<td class="p-1 text-center" style={day > currentDay ? 'background-color: gray;' : ''}>
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
