<script lang="ts">
	// USE DynamicClock instead if possible, it is much cleaner and more versatile
	import { digitsMapSmall } from '$lib/assets/Digitsmap.js';

	const digits = digitsMapSmall as Record<string, string[]>;

	let now = $state(new Date());
	let { countdown = $bindable() } = $props<{ countdown: number }>();

	$effect(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	const options: Record<string, string> = {
		'┐': 'leftDown',
		'┘': 'leftUp',
		'└': 'rightUp',
		'┌': 'rightDown',
		'─': 'horizontal',
		'│': 'vertical',
		' ': 'inactive'
	};

	const getFrameClass = (digit: string, index: number): string => {
		const char = digits[digit]?.[index] ?? ' ';
		return options[char] ?? 'inactive';
	};

	const seconds = $derived(now.getSeconds().toString().padStart(2, '0'));
	const minutes = $derived(now.getMinutes().toString().padStart(2, '0'));
	const hours = $derived(now.getHours().toString().padStart(2, '0'));
	const days = $derived(now.getDate().toString().padStart(2, '0'));
</script>

<div class="fullClock">
	Ny oppgave
	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(days[0], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>
	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(days[1], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="colon">
		{#each Array.from({ length: 12 }) as _, i (i)}
			<div class="frame {getFrameClass(':', i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>
	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(hours[0], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(hours[1], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="colon">
		{#each Array.from({ length: 12 }) as _, i (i)}
			<div class="frame {getFrameClass(':', i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(minutes[0], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(minutes[1], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="colon">
		{#each Array.from({ length: 12 }) as _, i (i)}
			<div class="frame {getFrameClass(':', i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(seconds[0], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>

	<div class="digit">
		{#each Array.from({ length: 24 }) as _, i (i)}
			<div class="frame {getFrameClass(seconds[1], i)}">
				<div class="hand"></div>
				<div class="hand"></div>
			</div>
		{/each}
	</div>
</div>

<style>
	.frame {
		position: relative;
		height: 2rem;
		width: 2rem;
		background: whitesmoke;
		border: 0.25rem solid lightgray;
		border-radius: 50%;
	}

	.hand {
		height: 0.1875rem;
		background: black;
		position: absolute;
		top: 50%;
		left: 50%;
		translate: 0 -50%;
		width: 50%;
		transform-origin: center left;
		transition: rotate 0.3s ease-in-out;
	}

	.leftDown {
		.hand:nth-child(1) {
			rotate: 180deg;
		}

		.hand:nth-child(2) {
			rotate: 90deg;
		}
	}

	.horizontal {
		.hand:nth-child(1) {
			rotate: 0deg;
		}

		.hand:nth-child(2) {
			rotate: 180deg;
		}
	}

	.rightDown {
		.hand:nth-child(1) {
			rotate: 0deg;
		}

		.hand:nth-child(2) {
			rotate: 90deg;
		}
	}

	.rightUp {
		.hand:nth-child(1) {
			rotate: -90deg;
		}

		.hand:nth-child(2) {
			rotate: 0deg;
		}
	}

	.leftUp {
		.hand:nth-child(1) {
			rotate: -90deg;
		}

		.hand:nth-child(2) {
			rotate: 180deg;
		}
	}

	.inactive {
		.hand {
			rotate: 135deg;
		}
	}

	.vertical {
		.hand:nth-child(1) {
			rotate: 90deg;
		}

		.hand:nth-child(2) {
			rotate: -90deg;
		}
	}

	.digit {
		display: grid;
		grid-template:
			repeat(6, 1fr) /
			repeat(4, 1fr);
	}

	.colon {
		display: grid;
		grid-template:
			repeat(6, 1fr) /
			repeat(2, 1fr);
	}

	.fullClock {
		display: flex;
		position: relative;
		justify-content: center;
		margin: 0 auto;
		width: max-content;
	}
</style>
