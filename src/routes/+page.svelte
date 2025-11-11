<script lang="ts">
	import { mockData } from '$lib/mockData.ts';
	import { X, Check, CheckCheck } from 'lucide-svelte';

	import type { member } from '$lib/server/db.ts';

	import type { LeaderboardData } from '$lib/server/db.ts';

	const sortedMembers = Object.values(mockData.members).sort(
		(a, b) => b.local_score - a.local_score
	);

	const getDayStatus = (member: member, day: number) => {
		const dayData = member.completion_day_level[day];
		if (!dayData) return 'none';
		if (dayData['2']) return 'both';
		if (dayData['1']) return 'one';
	};

	function convertUnixToDateTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }
</script>

<div>
	<div>
		<h1 class="text-5xl font-bold">AOC 2024</h1>
	</div>
	<div>
		<table class="w-full, border-collapse">
			<thead>
				<tr class="border-b">
					<th class="p-2 text-center">Rank</th>
					<th class="p-2 text-center">Navn</th>
					<th class="p-2 text-center">Stjerner</th>
					<th class="p-2 text-center">Score</th>

					<!--				 eslint-disable-next-line svelte/require-each-key -->
					{#each { length: mockData.num_days } as _, i}
						<th class="text-sm, w-8 p-2 text-center">{i + 1}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedMembers as member, i (member.id)}
					<tr>
						<td class="p-2 text-right">{i + 1}</td>
						<td class="p-2">{member.name || 'Anonymous'}</td>
						<td class="p-2 text-center">{member.stars}</td>
						<td class="p-2 text-center">{member.local_score}</td>
						{#each { length: mockData.num_days } as _, j (j)}
							{@const status = getDayStatus(member, j + 1)}
							<td class="p-1 text-center">
								{#if status === 'none'}
									<X />
								{:else if status === 'both'}
									<CheckCheck class="text-center text-2xl text-yellow-500" />
								{:else}
									<Check class="text-2xl text-slate-400" />
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
