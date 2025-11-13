<!--<script lang="ts">-->
<!--	import { Trophy, Star, Users, TrendingUp, Zap, Calendar, Award, Clock } from 'lucide-svelte';-->
<!--	import { type member } from '$lib/server/db.ts';-->

<!--	interface Props {-->
<!--		data?: any;-->
<!--		members?: Record<string, member>;-->
<!--		event?: string;-->
<!--	}-->

<!--	const { data = {}, members = {}, event = '2024' }: Props = $props();-->

<!--	const currentYear = parseInt(event);-->
<!--	const currentDay = 14;-->
<!--	const membersList = Object.values(members) as member[];-->

<!--	const overallStats = $derived(() => {-->
<!--		const totalMembers = membersList.length;-->
<!--		const totalStars = membersList.reduce((sum: number, m: member) => sum + m.stars, 0);-->
<!--		const avgStars = totalMembers > 0 ? (totalStars / totalMembers).toFixed(1) : '0';-->

<!--		const membersWithStars = membersList.filter((m: member) => m.stars > 0).length;-->
<!--		const participationRate = totalMembers > 0-->
<!--			? ((membersWithStars / totalMembers) * 100).toFixed(1)-->
<!--			: '0';-->

<!--		const maxPossibleStars = totalMembers * currentDay * 2;-->
<!--		const completionRate = maxPossibleStars > 0-->
<!--			? ((totalStars / maxPossibleStars) * 100).toFixed(1)-->
<!--			: '0';-->

<!--		return {-->
<!--			totalMembers,-->
<!--			totalStars,-->
<!--			avgStars,-->
<!--			participationRate,-->
<!--			completionRate,-->
<!--			membersWithStars-->
<!--		};-->
<!--	});-->

<!--	const topPerformers = $derived(() => {-->
<!--		return [...membersList]-->
<!--			.sort((a: member, b: member) => b.local_score - a.local_score)-->
<!--			.slice(0, 5);-->
<!--	});-->

<!--	const dayStats = $derived(() => {-->
<!--		const stats: any[] = [];-->

<!--		for (let day = 1; day <= currentDay; day++) {-->
<!--			let part1Count = 0;-->
<!--			let part2Count = 0;-->
<!--			const completionTimes: number[] = [];-->

<!--			membersList.forEach((member: member) => {-->
<!--				const dayData = member.completion_day_level[day];-->
<!--				if (dayData) {-->
<!--					if (dayData['1']) {-->
<!--						part1Count++;-->
<!--						const unlockTime = new Date(currentYear, 11, day, 6, 0, 0).getTime() / 1000;-->
<!--						const timeTaken = dayData['1'].get_star_ts - unlockTime;-->
<!--						if (timeTaken > 0) {-->
<!--							completionTimes.push(timeTaken);-->
<!--						}-->
<!--					}-->
<!--					if (dayData['2']) {-->
<!--						part2Count++;-->
<!--					}-->
<!--				}-->
<!--			});-->

<!--			const avgTime = completionTimes.length > 0-->
<!--				? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length-->
<!--				: 0;-->

<!--			stats.push({-->
<!--				day,-->
<!--				part1Count,-->
<!--				part2Count,-->
<!--				bothStars: part2Count,-->
<!--				totalAttempts: part1Count,-->
<!--				completionRate: membersList.length > 0 ? (part2Count / membersList.length) * 100 : 0,-->
<!--				avgTime-->
<!--			});-->
<!--		}-->

<!--		return stats;-->
<!--	});-->

<!--	const recentActivity = $derived(() => {-->
<!--		const activities: any[] = [];-->

<!--		membersList.forEach((member: member) => {-->
<!--			Object.entries(member.completion_day_level).forEach(([day, parts]: [string, any]) => {-->
<!--				if (parts['1']) {-->
<!--					activities.push({-->
<!--						member: member.name,-->
<!--						day: parseInt(day),-->
<!--						part: 1,-->
<!--						timestamp: parts['1'].get_star_ts-->
<!--					});-->
<!--				}-->
<!--				if (parts['2']) {-->
<!--					activities.push({-->
<!--						member: member.name,-->
<!--						day: parseInt(day),-->
<!--						part: 2,-->
<!--						timestamp: parts['2'].get_star_ts-->
<!--					});-->
<!--				}-->
<!--			});-->
<!--		});-->

<!--		return activities-->
<!--			.sort((a, b) => b.timestamp - a.timestamp)-->
<!--			.slice(0, 10);-->
<!--	});-->

<!--	const fastestSolvers = $derived(() => {-->
<!--		const fastest: any[] = [];-->

<!--		for (let day = 1; day <= Math.min(currentDay, 5); day++) {-->
<!--			const solvers: any[] = [];-->

<!--			membersList.forEach((member: member) => {-->
<!--				const dayData = member.completion_day_level[day];-->
<!--				if (dayData?.['2']) {-->
<!--					const unlockTime = new Date(currentYear, 11, day, 6, 0, 0).getTime() / 1000;-->
<!--					const timeTaken = dayData['2'].get_star_ts - unlockTime;-->

<!--					if (timeTaken > 0) {-->
<!--						solvers.push({-->
<!--							name: member.name,-->
<!--							time: timeTaken-->
<!--						});-->
<!--					}-->
<!--				}-->
<!--			});-->

<!--			if (solvers.length > 0) {-->
<!--				const fastestSolver = solvers.sort((a, b) => a.time - b.time)[0];-->
<!--				fastest.push({-->
<!--					day,-->
<!--					...fastestSolver-->
<!--				});-->
<!--			}-->
<!--		}-->

<!--		return fastest;-->
<!--	});-->

<!--	const formatTime = (seconds: number) => {-->
<!--		const hours = Math.floor(seconds / 3600);-->
<!--		const minutes = Math.floor((seconds % 3600) / 60);-->
<!--		const secs = Math.floor(seconds % 60);-->

<!--		if (hours > 0) {-->
<!--			return `${hours}t ${minutes}m`;-->
<!--		} else if (minutes > 0) {-->
<!--			return `${minutes}m ${secs}s`;-->
<!--		}-->
<!--		return `${secs}s`;-->
<!--	};-->

<!--	const formatDate = (timestamp: number) => {-->
<!--		return new Date(timestamp * 1000).toLocaleString('nb-NO', {-->
<!--			day: '2-digit',-->
<!--			month: '2-digit',-->
<!--			hour: '2-digit',-->
<!--			minute: '2-digit'-->
<!--		});-->
<!--	};-->

<!--	// Calculate streak (consecutive days with at least one star)-->
<!--	const calculateStreaks = $derived(() => {-->
<!--		const streaks = membersList.map((member: member) => {-->
<!--			let currentStreak = 0;-->
<!--			let maxStreak = 0;-->

<!--			for (let day = 1; day <= currentDay; day++) {-->
<!--				if (member.completion_day_level[day]) {-->
<!--					currentStreak++;-->
<!--					maxStreak = Math.max(maxStreak, currentStreak);-->
<!--				} else {-->
<!--					currentStreak = 0;-->
<!--				}-->
<!--			}-->

<!--			return {-->
<!--				name: member.name,-->
<!--				currentStreak,-->
<!--				maxStreak-->
<!--			};-->
<!--		});-->

<!--		return streaks-->
<!--			.filter(s => s.maxStreak > 0)-->
<!--			.sort((a, b) => b.maxStreak - a.maxStreak)-->
<!--			.slice(0, 5);-->
<!--	});-->
<!--</script>-->

<!--<div class="mx-auto max-w-7xl">-->
<!--	<h2 class="mb-6 text-3xl font-bold">Leaderboard-statistikk</h2>-->

<!--	&lt;!&ndash; Overall Statistics Cards &ndash;&gt;-->
<!--	<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">-->
<!--		<div class="rounded-lg bg-gradient-to-br from-blue-900/50 to-blue-700/50 p-4 text-center">-->
<!--			<div class="mb-2 flex justify-center text-blue-400">-->
<!--				<Users class="h-6 w-6" />-->
<!--			</div>-->
<!--			<div class="text-2xl font-bold">{overallStats().totalMembers}</div>-->
<!--			<div class="text-xs text-gray-400">Deltakere</div>-->
<!--		</div>-->

<!--		<div class="rounded-lg bg-gradient-to-br from-yellow-900/50 to-yellow-700/50 p-4 text-center">-->
<!--			<div class="mb-2 flex justify-center text-yellow-400">-->
<!--				<Star class="h-6 w-6" />-->
<!--			</div>-->
<!--			<div class="text-2xl font-bold">{overallStats().totalStars}</div>-->
<!--			<div class="text-xs text-gray-400">Totale stjerner</div>-->
<!--		</div>-->

<!--		<div class="rounded-lg bg-gradient-to-br from-green-900/50 to-green-700/50 p-4 text-center">-->
<!--			<div class="mb-2 flex justify-center text-green-400">-->
<!--				<TrendingUp class="h-6 w-6" />-->
<!--			</div>-->
<!--			<div class="text-2xl font-bold">{overallStats().avgStars}</div>-->
<!--			<div class="text-xs text-gray-400">Gj.snitt stjerner</div>-->
<!--		</div>-->

<!--		<div class="rounded-lg bg-gradient-to-br from-purple-900/50 to-purple-700/50 p-4 text-center">-->
<!--			<div class="mb-2 flex justify-center text-purple-400">-->
<!--				<Trophy class="h-6 w-6" />-->
<!--			</div>-->
<!--			<div class="text-2xl font-bold">{overallStats().participationRate}%</div>-->
<!--			<div class="text-xs text-gray-400">Deltakelse</div>-->
<!--		</div>-->

<!--		<div class="rounded-lg bg-gradient-to-br from-red-900/50 to-red-700/50 p-4 text-center">-->
<!--			<div class="mb-2 flex justify-center text-red-400">-->
<!--				<Calendar class="h-6 w-6" />-->
<!--			</div>-->
<!--			<div class="text-2xl font-bold">{currentDay}</div>-->
<!--			<div class="text-xs text-gray-400">Nåværende dag</div>-->
<!--		</div>-->

<!--		<div class="rounded-lg bg-gradient-to-br from-orange-900/50 to-orange-700/50 p-4 text-center">-->
<!--			<div class="mb-2 flex justify-center text-orange-400">-->
<!--				<Zap class="h-6 w-6" />-->
<!--			</div>-->
<!--			<div class="text-2xl font-bold">{overallStats().completionRate}%</div>-->
<!--			<div class="text-xs text-gray-400">Fullføringsrate</div>-->
<!--		</div>-->
<!--	</div>-->

<!--	<div class="grid gap-6 lg:grid-cols-2">-->
<!--		<div class="space-y-6">-->
<!--			<div class="rounded-lg bg-gray-800/50 p-6">-->
<!--				<h3 class="mb-4 flex items-center gap-2 text-xl font-bold">-->
<!--					<Trophy class="h-6 w-6 text-yellow-500" />-->
<!--					Topp 5 utøvere-->
<!--				</h3>-->
<!--				<div class="space-y-3">-->
<!--					{#each topPerformers() as member, index}-->
<!--						<div class="flex items-center justify-between rounded-lg bg-gray-700/30 p-3">-->
<!--							<div class="flex items-center gap-3">-->
<!--								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br {-->
<!--									index === 0 ? 'from-yellow-500 to-yellow-600' :-->
<!--									index === 1 ? 'from-gray-400 to-gray-500' :-->
<!--									index === 2 ? 'from-orange-600 to-orange-700' :-->
<!--									'from-gray-600 to-gray-700'-->
<!--								}">-->
<!--									<span class="text-sm font-bold">{index + 1}</span>-->
<!--								</div>-->
<!--								<span class="font-medium">{member.name}</span>-->
<!--							</div>-->
<!--							<div class="flex items-center gap-4">-->
<!--								<span class="text-yellow-500">★ {member.stars}</span>-->
<!--								<span class="font-bold text-green-500">{member.local_score}</span>-->
<!--							</div>-->
<!--						</div>-->
<!--					{/each}-->
<!--				</div>-->
<!--			</div>-->

<!--			<div class="rounded-lg bg-gray-800/50 p-6">-->
<!--				<h3 class="mb-4 flex items-center gap-2 text-xl font-bold">-->
<!--					<Award class="h-6 w-6 text-green-500" />-->
<!--					Beste streaks-->
<!--				</h3>-->
<!--				<div class="space-y-3">-->
<!--					{#each calculateStreaks() as streak, index}-->
<!--						<div class="flex items-center justify-between rounded-lg bg-gray-700/30 p-3">-->
<!--							<span class="font-medium">{streak.name}</span>-->
<!--							<div class="flex items-center gap-2">-->
<!--								<span class="text-sm text-gray-400">Max:</span>-->
<!--								<span class="font-bold text-green-500">{streak.maxStreak} dager</span>-->
<!--							</div>-->
<!--						</div>-->
<!--					{/each}-->
<!--				</div>-->
<!--			</div>-->

<!--			<div class="rounded-lg bg-gray-800/50 p-6">-->
<!--				<h3 class="mb-4 flex items-center gap-2 text-xl font-bold">-->
<!--					<Zap class="h-6 w-6 text-orange-500" />-->
<!--					Raskeste løsninger (topp 5 dager)-->
<!--				</h3>-->
<!--				<div class="space-y-3">-->
<!--					{#each fastestSolvers() as solver}-->
<!--						<div class="flex items-center justify-between rounded-lg bg-gray-700/30 p-3">-->
<!--							<div>-->
<!--								<span class="font-medium">{solver.name}</span>-->
<!--								<span class="ml-2 text-sm text-gray-400">- Dag {solver.day}</span>-->
<!--							</div>-->
<!--							<span class="font-bold text-orange-500">{formatTime(solver.time)}</span>-->
<!--						</div>-->
<!--					{/each}-->
<!--				</div>-->
<!--			</div>-->
<!--		</div>-->

<!--		<div class="space-y-6">-->
<!--			<div class="rounded-lg bg-gray-800/50 p-6">-->
<!--				<h3 class="mb-4 flex items-center gap-2 text-xl font-bold">-->
<!--					<Clock class="h-6 w-6 text-blue-500" />-->
<!--					Nylig aktivitet-->
<!--				</h3>-->
<!--				<div class="space-y-2">-->
<!--					{#each recentActivity() as activity}-->
<!--						<div class="flex items-center justify-between rounded-lg bg-gray-700/30 p-2 text-sm">-->
<!--							<div class="flex items-center gap-2">-->
<!--								<span class="text-yellow-500">★</span>-->
<!--								<span class="font-medium">{activity.member}</span>-->
<!--								<span class="text-gray-400">-->
<!--									fullførte dag {activity.day} del {activity.part}-->
<!--								</span>-->
<!--							</div>-->
<!--							<span class="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>-->
<!--						</div>-->
<!--					{/each}-->
<!--				</div>-->
<!--			</div>-->

<!--			<div class="rounded-lg bg-gray-800/50 p-6">-->
<!--				<h3 class="mb-4 flex items-center gap-2 text-xl font-bold">-->
<!--					<Calendar class="h-6 w-6 text-purple-500" />-->
<!--					Dag-for-dag statistikk-->
<!--				</h3>-->
<!--				<div class="overflow-x-auto">-->
<!--					<table class="w-full text-sm">-->
<!--						<thead>-->
<!--						<tr class="border-b border-gray-700">-->
<!--							<th class="p-2 text-left">Dag</th>-->
<!--							<th class="p-2 text-center">Del 1</th>-->
<!--							<th class="p-2 text-center">Del 2</th>-->
<!--							<th class="p-2 text-center">Rate</th>-->
<!--							<th class="p-2 text-right">Gj.snitt tid</th>-->
<!--						</tr>-->
<!--						</thead>-->
<!--						<tbody>-->
<!--						{#each dayStats() as stat}-->
<!--							<tr class="border-b border-gray-700/50">-->
<!--								<td class="p-2 font-medium">Dag {stat.day}</td>-->
<!--								<td class="p-2 text-center text-slate-400">{stat.part1Count}</td>-->
<!--								<td class="p-2 text-center text-yellow-500">{stat.part2Count}</td>-->
<!--								<td class="p-2 text-center">-->
<!--									<span class="text-green-500">{stat.completionRate.toFixed(0)}%</span>-->
<!--								</td>-->
<!--								<td class="p-2 text-right text-gray-400">{formatTime(stat.avgTime)}</td>-->
<!--							</tr>-->
<!--						{/each}-->
<!--						</tbody>-->
<!--					</table>-->
<!--				</div>-->
<!--			</div>-->
<!--		</div>-->
<!--	</div>-->

<!--	<div class="mt-6 rounded-lg bg-gray-800/50 p-6">-->
<!--		<h3 class="mb-4 text-xl font-bold">Fullføringsrate per dag</h3>-->
<!--		<div class="space-y-2">-->
<!--			{#each dayStats() as stat}-->
<!--				<div class="flex items-center gap-3">-->
<!--					<span class="w-16 text-sm text-gray-400">Dag {stat.day}</span>-->
<!--					<div class="flex-1">-->
<!--						<div class="h-6 overflow-hidden rounded-full bg-gray-700">-->
<!--							<div-->
<!--								class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"-->
<!--								style="width: {stat.completionRate}%"-->
<!--							></div>-->
<!--						</div>-->
<!--					</div>-->
<!--					<span class="w-16 text-right text-sm font-medium">{stat.completionRate.toFixed(0)}%</span>-->
<!--					<span class="w-20 text-right text-xs text-gray-500">{stat.bothStars}/{overallStats().totalMembers}</span>-->
<!--				</div>-->
<!--			{/each}-->
<!--		</div>-->
<!--	</div>-->
<!--</div>-->

<div>a</div>
