<script lang="ts">
	import Autoplay from 'embla-carousel-autoplay';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	let { missingDays = [] }: { missingDays: number[] } = $props();

	const plugin = Autoplay({ delay: 2000, stopOnInteraction: true });
</script>

{#if missingDays.length > 0}
	<Carousel.Root
		plugins={[plugin]}
		class="h-16 w-full max-w-xs"
		onmouseenter={plugin.stop}
		onmouseleave={plugin.reset}
	>
		<Carousel.Content>
			{#each missingDays as day (day)}
				<Carousel.Item>
					<div class="h-full p-1">
						<Card.Root class="h-full">
							<Card.Content class="flex h-full items-center justify-center p-2">
								<span class="text-2xl font-semibold">Day {day}</span>
							</Card.Content>
						</Card.Root>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
{:else}
	<div class="flex h-full items-center justify-center">
		<span class="text-xl font-semibold text-green-600">All days completed! 🎉</span>
	</div>
{/if}
