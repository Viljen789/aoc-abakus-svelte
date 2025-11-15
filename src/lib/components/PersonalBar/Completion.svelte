<script lang="ts">
	let { solved = 0, totalProblems = 50 }: { solved: number; totalProblems: number } = $props();

	const percentage = $derived(Math.min(Math.round((solved / totalProblems) * 100), 100));
	const degrees = $derived(Math.min(percentage * 3.6, 359.99)); // cap just under 360

	const gradient = $derived(`
    conic-gradient(
      from 0deg at 50% 50%,
      #3b82f6 0deg,
      #8b5cf6 ${degrees * 0.5}deg,
      #06b6d4 ${degrees}deg,
      #e5e7eb ${degrees}deg,
      #e5e7eb 360deg
    )
  `);
</script>

<div class="outer h-full rounded-lg shadow-md" style="--bg: {gradient};">
	<div class="inner h-full rounded-md">
		<div class="content">
			<div class=" mb-2 text-center">
				<!--        <span class="font-semibold">Fullført:</span>-->
				<span class="text-center text-2xl text-gray-600"
					>{solved}/{totalProblems} ({percentage}%)</span
				>
			</div>
		</div>
	</div>
</div>

<style>
	.outer {
		position: relative;
		padding: 5px;
		background: var(--bg, none);
	}

	.inner {
		background: white;
	}

	.content {
		padding: 1.5rem;
	}
</style>
