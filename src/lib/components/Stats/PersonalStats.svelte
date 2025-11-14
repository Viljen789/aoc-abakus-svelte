<script>
	import { numToTally } from '$lib/utils/TallyNums.ts';
	import { ArrowBigRightDash, ExternalLink, Info, X } from 'lucide-svelte';
	import Statistics from '$lib/components/Stats/Statistics.svelte';
	import { formattedDiff, SecsToDHMS, startCountdown, countdownTime } from '$lib/utils/time.ts';
	import DynamicClock from '$lib/components/DynamicClock.svelte';
	import { faFire } from '@fortawesome/free-solid-svg-icons';
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import { Fa } from 'svelte-fa';

	const { data = {}, members = {}, event = '2024' } = $props();
	const targetDate = 1761951600;
	$effect(() => {
		if (typeof window !== 'undefined') startCountdown(targetDate);
	});

	const streak = 19; //Example
	const solved = 42; //Example
	const totalProblems = 50; //Example
	const nextTaskDay = 3; //Example
	const nextTaskPart = 1; //Example
	const currentDay = 3;
	const currentYear = parseInt(event);
	const percentage = Math.round((solved / totalProblems) * 100);
	const exampleAvgTime = 1000000; //Example in s

	let statsModal;

	function openStats() {
		statsModal?.showModal();
	}

	function closeStats() {
		statsModal?.close();
	}

	// Flickering fire animation
	const fireFlicker = tweened(1, {
		duration: 100,
		easing: quintOut
	});

	// Create sparks based on streak value
	interface Spark {
		id: number;
		x: number;
		delay: number;
		duration: number;
	}

	let sparks = $state<Spark[]>([]);
	let sparkIdCounter = 0;

	function generateSparks() {
		const sparkCount = Math.min(Math.floor(streak / 2), 15); // More sparks for higher streaks
		sparks = Array.from({ length: sparkCount }, (_, i) => ({
			id: sparkIdCounter++,
			x: Math.random() * 40 - 20, // Random horizontal offset
			delay: Math.random() * 2000, // Stagger spark timing
			duration: 2000 + Math.random() * 1000 // Random duration
		}));
	}

	// Continuous flickering effect
	$effect(() => {
		const flickerInterval = setInterval(() => {
			fireFlicker.set(0.7 + Math.random() * 0.3); // Random flicker between 0.7 and 1
		}, 150);

		generateSparks();
		const sparkInterval = setInterval(() => {
			generateSparks();
		}, 3000); // Regenerate sparks every 3 seconds

		return () => {
			clearInterval(flickerInterval);
			clearInterval(sparkInterval);
		};
	});
</script>

<div class="mb-6 flex justify-around rounded-lg bg-white p-4 shadow-md">
	<div class="relative flex items-center justify-center">
		<!-- Streak counter -->
		<div class="mr-4 text-center">
			<div class="text-sm font-semibold text-gray-600">Streak</div>
			<div class="text-3xl font-bold text-orange-600">{streak}</div>
		</div>

		<!-- Flame with flickering animation -->
		<div class="relative">
			<div
				class="transition-all duration-100"
				style="
					filter:
						drop-shadow(0 0 {$fireFlicker * 15}px orange)
						drop-shadow(0 0 {$fireFlicker * 25}px red)
						brightness({$fireFlicker});
					transform: scale({0.95 + $fireFlicker * 0.05});
				"
			>
				<Fa icon={faFire} size="2x" class="text-red-500" />
			</div>

			<!-- Spark particles -->
			{#each sparks as spark (spark.id)}
				<div
					class="spark"
					style="
						left: {spark.x}px;
						animation-delay: {spark.delay}ms;
						animation-duration: {spark.duration}ms;
					"
				></div>
			{/each}
		</div>
	</div>
	<div class="mb-6 flex justify-around rounded-lg bg-white p-4 shadow-md">
		<div class="w-full">
			<div class="mb-2 flex justify-between">
				<span class="font-semibold">Fullført: </span>
				<span class="text-gray-600">{solved}/{totalProblems} ({percentage}%)</span>
			</div>
			<div class="h-4 w-full overflow-hidden rounded-full bg-gray-200">
				<div
					class="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out"
					style:width="{percentage}%"
				></div>
			</div>
		</div>
	</div>
	<div class="mb-6 flex justify-around rounded-lg bg-white p-4 shadow-md">
		{#if currentDay > 0 && nextTaskDay <= currentDay}
			<a
				href="https://adventofcode.com/{currentYear}/day/{nextTaskDay}"
				class="flex-col items-center justify-center"
			>
				<p>Dag {nextTaskDay} Del {nextTaskPart}</p>
				<ExternalLink class="w-full text-blue-600 duration-500 ease-in-out hover:scale-130" />
			</a>
		{:else if currentDay === 0}
			<span>Eventet starter snart!</span>
		{:else if currentDay + 1 === nextTaskDay}
			<span>Gled deg til i morgen!</span>
		{:else}
			<span>Dag {nextTaskDay} Del {nextTaskPart}</span>
		{/if}
	</div>
	{#if data.user}
		<div class="mb-6 flex justify-around rounded-lg bg-white p-4 shadow-md">
			Gjennomsnittlig tid: {formattedDiff(0, exampleAvgTime)};
			<!--			<DynamicClock countdown={$countdownTime}/>-->
		</div>
	{/if}
</div>

<!--<dialog bind:this={statsModal} onclick={(e) => {-->
<!--	if (e.target === statsModal) closeStats();-->
<!--}}>-->
<!--	<div>-->
<!--		<div>-->
<!--			<h2>Din statistikk</h2>-->
<!--			<button onclick={closeStats} aria-label="Lukk">-->
<!--				<X />-->
<!--			</button>-->
<!--		</div>-->
<!--		<div>-->
<!--			<Statistics {data} {members} {event} />-->
<!--		</div>-->
<!--	</div>-->
<!--</dialog>-->

<style>
	.spark {
		position: absolute;
		bottom: 20px;
		width: 3px;
		height: 3px;
		background: radial-gradient(circle, #ff6b00, #ff9500);
		border-radius: 50%;
		animation: rise linear infinite;
		pointer-events: none;
	}

	@keyframes rise {
		0% {
			transform: translateY(0) translateX(0) scale(1);
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
		100% {
			transform: translateY(-80px) translateX(var(--drift, 10px)) scale(0.3);
			opacity: 0;
		}
	}

	/* Add subtle pulsing to the flame container */
	.relative {
		animation: pulse 3s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}
</style>
