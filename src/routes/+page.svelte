<script lang="ts">
	import { ChartLine, Crown, UserStar, User } from 'lucide-svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Profile from '$lib/components/Profile.svelte';
	import Page from '$lib/components/Stats/+page.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import { timeDiff, diffToFormat, formattedDiff } from '$lib/utils/time';
	import DynamicClock from '$lib/components/DynamicClock.svelte';
	import LogOut from '$lib/components/LogOut.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	const { data } = $props();
	// const firstDay = data.first_day ?? Math.floor(Date.now() / 1000); // ms
	const firstDay = 1761951600000; // Needs to be in ms
	// const firstday = firstDay();
	const targetDate = 1761951600000;

	const currentDay = timeDiff(firstDay, new Date().getTime()).d;

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
		{ component: Page, icon: ChartLine },
		{ component: Profile, icon: UserStar }
	];
	const CurrentView = $derived(views[activeTab].component);


	const handleLogout = async () => {
		await fetch('/auth/logout', { method: 'POST' });
		window.location.reload();
	};
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-5xl font-bold">AOC 2024</h1>

		<div class="flex items-center gap-4">
			{#if data.user}
				<div class="flex items-center gap-2">
					<User class="h-5 w-5" />
					<span class="font-medium">{data.user.fullName}</span>
				</div>
				<button
					onclick={handleLogout}
					class="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					<LogOut class="h-4 w-4" />
				</button>
			{:else}
				<a href="/auth/login" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
					Logg inn med Abakus
				</a>
			{/if}
		</div>
	</div>
	<Tabs bind:activeTab icons={views.map((view) => view.icon)} />
	<CurrentView {data} members={data.members} event={data.event}/>
	<!--		<Clock countdown={timeRemaining} />-->
	<!--		<DynamicClock countdown={timeRemaining} />-->
	Current day: {currentDay}
</div>
