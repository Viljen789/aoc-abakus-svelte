<script lang="ts">
	import { X, Check, CheckCheck, CalendarClock } from 'lucide-svelte';
	import type { member } from '$lib/server/db.ts';

	const { result = { members: {}, event: '2024' }, recentStars = [] } = $props();
	const currentDay = 17;

	const sortedMembers = Object.values(result.members).sort((a, b) => b.local_score - a.local_score);

	const getDayStatus = (member: member, day: number) => {
		const dayData = member.completion_day_level[day];
		if (!dayData) return 'none';
		if (dayData['2']) return 'both';
		if (dayData['1']) return 'one';
	};

	const recentStarsSet = new Set(recentStars.map((s) => `${s.member_id}-${s.day}-${s.part}`));
	console.log(recentStarsSet);

	const isStarRecent = (memberId: number, day: number, part: number) => {
		return recentStarsSet.has(`${memberId}-${day}-${part}`);
	};
</script>

<div>
	<div>
		<table class="w-full, border-collapse">
			<thead>
				<tr class="">
					<th class="p-2 text-right">Rank</th>
					<th class="p-2 text-left">Navn</th>
					<th class="p-2 text-center">Stjerner</th>
					<th class="p-2 text-center">Score</th>

					<!--				 eslint-disable-next-line svelte/require-each-key -->
					{#each Array.from({ length: 25 }, (_, i) => i + 1) as day, i (day)}
						<th
							class="text-sm, w-8 p-2 text-center"
							style={day > currentDay ? 'filter:; background-color: gray;' : ''}
						>
							{#if day <= currentDay}
								{day}
							{:else}
								<CalendarClock />
							{/if}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedMembers as member, i (member.id)}
					<tr class="nth-last-of-type-[-n+3]:">
						<td class="p-2 text-right">{i + 1}</td>
						<td class="p-2">{member.name || 'Anonymous'}</td>
						<td class="p-2 text-center">{member.stars}</td>
						<td class="p-2 text-center">{member.local_score}</td>
						{#each Array.from({ length: 25 }, (_, i) => i + 1) as day, i (day)}
							{@const status = getDayStatus(member, day)}
							<td class="p-1 text-center" style={day > currentDay ? 'background-color: gray;' : ''}>
								{#if status === 'none' && day <= currentDay}
									-
								{:else if status === 'both'}
									<CheckCheck
										class="text-center text-2xl text-yellow-500 {isStarRecent(member.id, day, 2)
											? 'shimmer'
											: ''}"
									/>
								{:else if status === 'one'}
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
