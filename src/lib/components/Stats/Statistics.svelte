<!--<script lang="ts">-->
<!--	import {-->
<!--		X,-->
<!--		Check,-->
<!--		CheckCheck,-->
<!--		CalendarClock,-->
<!--		Trophy,-->
<!--		Star,-->
<!--		Clock,-->
<!--		Calendar-->
<!--	} from 'lucide-svelte';-->
<!--	import { type member } from '$lib/server/db.ts';-->

<!--	interface Props {-->
<!--		data?: any;-->
<!--		members?: Record<string, member>;-->
<!--		event?: string;-->
<!--	} -->

<!--	const { data = {}, members = {}, event = '2024' }: Props = $props();-->

<!--	const currentYear = parseInt(event);-->
<!--	const currentDay = 14;-->
<!--	/*const TEST_MEMBER_ID = '2579356';-->

<!--	const currentMember: member | null =-->
<!--		members[TEST_MEMBER_ID] ?? Object.values(members)[0] ?? null;*/-->

<!--	const userMember = $derived(() => {-->
<!--		if (!data.user) return null;-->
<!--		return Object.values(members).find((m: member) => {-->
<!--			return (-->
<!--				m.name?.toLowerCase().includes(data.user.fullName.toLowerCase()) ||-->
<!--				m.name?.toLowerCase().includes(data.user.firstName.toLowerCase())-->
<!--			);-->
<!--		});-->
<!--	});-->
<!--	const currentMember: member | null = $derived(() => {-->
<!--		if (userMember()) {-->
<!--			return userMember();-->
<!--		} else {-->
<!--			return Object.values(members)[0] ?? null;-->
<!--		}-->
<!--	});-->
<!--	const userRank = $derived(() => {-->
<!--		if (!currentMember) return null;-->
<!--		const sorted = Object.values(members).sort(-->
<!--			(a: member, b: member) => b.local_score - a.local_score-->
<!--		);-->
<!--		return sorted.findIndex((m: member) => m.id === currentMember.id) + 1;-->
<!--	});-->

<!--	const getDayStatus = (member: member, day: number) => {-->
<!--		if (!member || !member.completion_day_level) return 'none';-->
<!--		const dayData = member.completion_day_level[day];-->
<!--		if (!dayData) return 'none';-->
<!--		if (dayData['2']) return 'both';-->
<!--		if (dayData['1']) return 'one';-->
<!--		return 'none';-->
<!--	};-->

<!--	const stats = $derived(() => {-->
<!--		if (!currentMember || !currentMember.completion_day_level) return null;-->

<!--		const completedDays = Object.keys(currentMember.completion_day_level || {}).length;-->
<!--		const totalStars = currentMember.stars || 0;-->
<!--		const bothStars = Object.values(currentMember.completion_day_level || {}).filter(-->
<!--			(day: any) => day['2']-->
<!--		).length;-->
<!--		const oneStar = completedDays - bothStars;-->

<!--		const part1Times: number[] = [];-->
<!--		Object.entries(currentMember.completion_day_level || {}).forEach(([day, parts]: [string, any]) => {-->
<!--			if (parts['1']) {-->
<!--				const dayNum = parseInt(day);-->
<!--				const unlockTime = new Date(currentYear, 11, dayNum, 6, 0, 0).getTime() / 1000;-->
<!--				const completionTime = parts['1'].get_star_ts;-->
<!--				const timeTaken = completionTime - unlockTime;-->
<!--				if (timeTaken > 0) {-->
<!--					part1Times.push(timeTaken);-->
<!--				}-->
<!--			}-->
<!--		});-->

<!--		const avgPart1Time =-->
<!--			part1Times.length > 0 ? part1Times.reduce((a, b) => a + b, 0) / part1Times.length : 0;-->

<!--		return {-->
<!--			completedDays,-->
<!--			totalStars,-->
<!--			bothStars,-->
<!--			oneStar,-->
<!--			avgPart1Time,-->
<!--			localScore: currentMember.local_score,-->
<!--			lastStarTs: currentMember.last_star_ts-->
<!--		};-->
<!--	});-->

<!--	const formatTime = (seconds: number) => {-->
<!--		const hours = Math.floor(seconds / 3600);-->
<!--		const minutes = Math.floor((seconds % 3600) / 60);-->
<!--		if (hours > 0) {-->
<!--			return `${hours}h ${minutes}m`;-->
<!--		}-->
<!--		return `${minutes}m`;-->
<!--	};-->

<!--	const formatDate = (timestamp: number) => {-->
<!--		return new Date(timestamp * 1000).toLocaleString('nb-NO', {-->
<!--			day: '2-digit',-->
<!--			month: '2-digit',-->
<!--			year: 'numeric',-->
<!--			hour: '2-digit',-->
<!--			minute: '2-digit'-->
<!--		});-->
<!--	};-->
<!--</script>-->

<!--{#if !data.user}-->
<!--	<div class="bg-yellow-50 p-8 text-center">-->
<!--		<h2 class="mb-4 text-2xl font-bold">Ikke pålogget</h2>-->
<!--		<p class="mb-4">Du må logge inn for å se din profil.</p>-->
<!--		<a href="/auth/login" class="inline-block bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">-->
<!--			Logg inn med Abakus-->
<!--		</a>-->
<!--	</div>-->
<!--{:else if !currentMember}-->
<!--	<div class="bg-yellow-50 p-8 text-center">-->
<!--		<h2 class="mb-4 text-2xl font-bold">Profil ikke funnet</h2>-->
<!--		<p class="mb-4">Vi finner ikke din Advent of Code-profil på leaderboardet.</p>-->
<!--		<p class="text-sm text-gray-600">-->
<!--			Sørg for at du har koblet til din AOC-konto og at navnet ditt matcher.-->
<!--		</p>-->
<!--	</div>-->
<!--{:else}-->
<!--	&lt;!&ndash; Profile Header &ndash;&gt;-->
<!--	<div class="mb-6 bg-slate-100 p-6">-->
<!--		<div class="flex items-center justify-between">-->
<!--			<div>-->
<!--				<h2 class="mb-2 text-3xl font-bold">{data.user.fullName}</h2>-->
<!--				<p class="text-lg">AOC Brukernavn: {currentMember.name}</p>-->
<!--			</div>-->
<!--			<div class="text-right">-->
<!--				<div class="mb-1 text-4xl font-bold text-yellow-600">#{userRank()}</div>-->
<!--				<div class="text-sm">Rangering</div>-->
<!--			</div>-->
<!--		</div>-->
<!--	</div>-->

<!--	&lt;!&ndash; Statistics Cards &ndash;&gt;-->
<!--	<div class="mb-6">-->
<!--		<table class="w-full border-collapse">-->
<!--			<tbody>-->
<!--			<tr class="odd:bg-slate-100 hover:bg-slate-300 transition-colors">-->
<!--				<td class="p-4 text-center">-->
<!--					<Star class="inline-block h-6 w-6 text-yellow-500 mb-1" />-->
<!--					<div class="text-2xl font-bold">{stats()?.totalStars}</div>-->
<!--					<div class="text-sm">Totale stjerner</div>-->
<!--				</td>-->
<!--				<td class="p-4 text-center">-->
<!--					<Trophy class="inline-block h-6 w-6 text-green-600 mb-1" />-->
<!--					<div class="text-2xl font-bold">{stats()?.localScore}</div>-->
<!--					<div class="text-sm">Poeng</div>-->
<!--				</td>-->
<!--				<td class="p-4 text-center">-->
<!--					<Calendar class="inline-block h-6 w-6 text-blue-600 mb-1" />-->
<!--					<div class="text-2xl font-bold">{stats()?.completedDays}</div>-->
<!--					<div class="text-sm">Dager fullført</div>-->
<!--				</td>-->
<!--				<td class="p-4 text-center">-->
<!--					<Clock class="inline-block h-6 w-6 text-purple-600 mb-1" />-->
<!--					<div class="text-xl font-bold">{formatTime(stats()?.avgPart1Time || 0)}</div>-->
<!--					<div class="text-sm">Gj.snitt tid (del 1)</div>-->
<!--				</td>-->
<!--			</tr>-->
<!--			</tbody>-->
<!--		</table>-->
<!--	</div>-->

<!--	&lt;!&ndash; Completion Details &ndash;&gt;-->
<!--	<div class="mb-6 bg-slate-100 p-4">-->
<!--		<h3 class="mb-4 text-xl font-bold">Fullføringsdetaljer</h3>-->
<!--		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">-->
<!--			<div>-->
<!--				<span>Dager med begge stjerner:</span>-->
<!--				<span class="ml-2 font-bold text-yellow-600">{stats()?.bothStars}</span>-->
<!--			</div>-->
<!--			<div>-->
<!--				<span>Dager med én stjerne:</span>-->
<!--				<span class="ml-2 font-bold">{stats()?.oneStar}</span>-->
<!--			</div>-->
<!--			{#if stats()?.lastStarTs}-->
<!--				<div>-->
<!--					<span>Siste stjerne:</span>-->
<!--					<span class="ml-2 font-bold">{formatDate(stats()?.lastStarTs || 0)}</span>-->
<!--				</div>-->
<!--			{/if}-->
<!--		</div>-->
<!--	</div>-->

<!--	&lt;!&ndash; Personal Completion Grid &ndash;&gt;-->
<!--	<div>-->
<!--		<h3 class="mb-4 text-xl font-bold">Din fullføringskalender</h3>-->
<!--		<div class="overflow-x-auto">-->
<!--			<table class="w-full border-collapse">-->
<!--				<thead>-->
<!--				<tr>-->
<!--					<th class="p-2 text-left">Dag</th>-->
<!--					<th class="p-2 text-center">Status</th>-->
<!--					<th class="p-2 text-left">Del 1</th>-->
<!--					<th class="p-2 text-left">Del 2</th>-->
<!--				</tr>-->
<!--				</thead>-->
<!--				<tbody>-->
<!--				{#each Array.from({ length: 25 }, (_, i) => i + 1) as day (day)}-->
<!--					{@const status = getDayStatus(currentMember, day)}-->
<!--					{@const dayData = currentMember?.completion_day_level?.[day]}-->
<!--					<tr class="odd:bg-slate-100 hover:bg-slate-300 transition-colors">-->
<!--						<td class="p-2">-->
<!--							<a>-->
<!--								href={`https://adventofcode.com/${currentYear}/day/${day}`}-->
<!--								class="text-blue-600 hover:underline"-->
<!--								>-->
<!--								Dag {day}-->
<!--							</a>-->
<!--						</td>-->
<!--						<td class="p-2 text-center">-->
<!--							{#if day > currentDay}-->
<!--								<CalendarClock class="inline-block h-6 w-6" />-->
<!--							{:else if status === 'both'}-->
<!--								<CheckCheck class="inline-block h-6 w-6 text-yellow-500" />-->
<!--							{:else if status === 'one'}-->
<!--								<Check class="inline-block h-6 w-6 text-slate-400" />-->
<!--							{:else}-->
<!--								<X class="inline-block h-6 w-6" />-->
<!--							{/if}-->
<!--						</td>-->
<!--						<td class="p-2 text-sm">-->
<!--							{#if dayData?.['1']}-->
<!--								<span class="text-green-600">✓</span>-->
<!--								{formatDate(dayData['1'].get_star_ts)}-->
<!--							{:else if day <= currentDay}-->
<!--								<span>Ikke fullført</span>-->
<!--							{:else}-->
<!--								<span>Låst</span>-->
<!--							{/if}-->
<!--						</td>-->
<!--						<td class="p-2 text-sm">-->
<!--							{#if dayData?.['2']}-->
<!--								<span class="text-green-600">✓</span>-->
<!--								{formatDate(dayData['2'].get_star_ts)}-->
<!--							{:else if day <= currentDay}-->
<!--								<span>Ikke fullført</span>-->
<!--							{:else}-->
<!--								<span>Låst</span>-->
<!--							{/if}-->
<!--						</td>-->
<!--					</tr>-->
<!--				{/each}-->
<!--				</tbody>-->
<!--			</table>-->
<!--		</div>-->
<!--	</div>-->
<!--{/if}-->
