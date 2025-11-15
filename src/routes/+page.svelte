<script lang="ts">
	import { ChartLine, Crown, UserStar, User, LogIn } from 'lucide-svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Statistics from '$lib/components/Stats/Statistics.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { timeDiffObj, diffToFormat, formattedDiff } from '$lib/utils/time';
	import DynamicClock from '$lib/components/DynamicClock.svelte';
	import LogOut from '$lib/components/LogOut.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import tippy from 'tippy.js';
	import Page from '$lib/components/PersonalBar/+page.svelte';
	import { numToTally } from '$lib/utils/TallyNums.ts';
	import ApiDebugData from '$lib/components/ApiDebugData.svelte';
	import { siGithub } from 'simple-icons';

	const { data } = $props();
	// const firstDay = data.first_day ?? Math.floor(Date.now() / 1000); // ms
	const firstDay = 1761951600000; // Needs to be in ms
	// const firstday = firstDay();
	const targetDate = 1761951600000;

	const currentDay = timeDiffObj(firstDay, new Date().getTime()).d;

	let elapsed = $state(0);

	let timeRemaining = $state('calculating...');

	let time: number = $state(new Date().getTime());

	$effect(() => {
		timeRemaining = formattedDiff(time, targetDate);
		time = Date.now();
		const interval = setInterval(() => {
			time = Date.now();
			timeRemaining = formattedDiff(time, targetDate);
		}, 1000);
		return () => clearInterval(interval);
	});

	let activeTab = $state(0);

	const views = [
		{ component: Leaderboard, icon: Crown },
		{ component: Statistics, icon: ChartLine },
		{ component: Statistics, icon: UserStar }
	];
	const CurrentView = $derived(views[activeTab].component);

	const handleLogout = async () => {
		await fetch('/auth/logout', { method: 'POST' });
		window.location.reload();
	};

	const tallyComp = numToTally(12);
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-5xl font-bold">Advent of Code - Abakus</h1>

		<div class="flex items-center gap-4">
			{#if data.user}
				<div class="flex flex-col items-end">
					<div class="flex items-center gap-2">
						<span class="text-2xl">{data.user.fullName}</span>
					</div>
					<div class="ml-2 flex items-center gap-2 text-lg text-gray-600">
						<p>@{data.user.username}</p>
						•
						{#if data.user.githubUsername}
							<a
								href="github.com/{data.user.githubUsername}"
								class="flex items-center gap-1 text-lg text-gray-400 hover:underline"
							>
								<svg
									role="img"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4 fill-current"
								>
									<path d={siGithub.path} />
								</svg>{data.user.githubUsername}
							</a>
						{/if}
					</div>
				</div>
				<button
					onclick={handleLogout}
					class="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					<LogOut />
				</button>
				<!--{:else}
					<a href="/auth/login" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
						Logg inn med Abakus
					</a>-->
			{/if}
		</div>
	</div>
	<!--	<Tabs bind:activeTab icons={views.map((view) => view.icon)} />-->

	{#if data.user}
		<Page {data} members={data.members} event={data.event} />
	{:else}
		<div class="rounded-md bg-yellow-50 p-8 text-center">
			<h2 class="mb-4 text-2xl font-bold">Ikke pålogget</h2>
			<p class="mb-4">Du må logge inn for å se din profi.</p>
			<a
				href="/auth/login"
				class="inline-block bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
			>
				Logg inn med Abakus
			</a>
		</div>
	{/if}

	<CurrentView {data} members={data.members} event={data.event} />
	<ApiDebugData {data} />

	{#each Object.values(data.members) as member}
		<div class="flex items-center gap-4">
			<p>AOC name: {member.name}</p>
			{#if member.abakusUser}
				<div class="flex gap-4">
					<p>Abakus name: {member.abakusUser.fullName}</p>
					<p>Username: @{member.abakusUser.username}</p>
				</div>
			{/if}
		</div>
	{/each}

	<!--		<Clock countdown={timeRemaining} />-->
	<!--&lt;!&ndash;			<DynamicClock countdown={timeRemaining} />&ndash;&gt;-->
	<!--	Current day: {currentDay}-->
</div>
