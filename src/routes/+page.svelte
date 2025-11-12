<script lang="ts">
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import Heatmap from '$lib/components/Heatmap.svelte';
	import ProgressChart from '$lib/components/ProgressChart.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import { timeDiff, diffToFormat, formattedDiff } from '$lib/utils/time';
	import DynamicClock from '$lib/components/DynamicClock.svelte';

	const { data } = $props();
	// const firstDay = data.first_day ?? Math.floor(Date.now() / 1000);
	const firstDay = 1761951600;

	const currentDay = timeDiff(firstDay, new Date().getTime());

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
	const targetDate = 1763071200000;

	const views = [
		{ component: Leaderboard, label: 'Leaderboard' },
		{ component: Heatmap, label: 'Heatmap' },
		{ component: ProgressChart, label: 'Progress' }
	];
	const CurrentView = $derived(views[activeTab].component);
</script>

<div>
	<Tabs bind:activeTab labels={views.map((view) => view.label)} />
	<CurrentView {data} result={data.result} recentStars={data.recentStars} />
	{activeTab}
	{firstDay}
	{formattedDiff(firstDay, new Date().getTime())}
	{timeRemaining}
<!--	<Clock countdown={timeRemaining} />-->
	<DynamicClock countdown={timeRemaining} />

</div>
