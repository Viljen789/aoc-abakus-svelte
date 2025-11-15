<script lang="ts">
	import { faFire } from '@fortawesome/free-solid-svg-icons';

	let { streak = 0 }: { streak: number } = $props();

	const sparkNums = streak < 5 ? 0 : Math.min(6, Math.floor(streak / 3) + 1);
	const glowIntensity = streak;

	const firePath: string = Array.isArray(faFire.icon[4])
		? faFire.icon[4][0]
		: (faFire.icon[4] as string);

	let containerGlow = $derived(`
    box-shadow:
      0 0 ${glowIntensity * 2}px rgba(255, 140, 0, ${0.3 + glowIntensity * 0.015}),
      0 0 ${glowIntensity * 4}px rgba(255, 69, 0, ${0.2 + glowIntensity * 0.01}),
      0 0 ${glowIntensity * 6}px rgba(220, 38, 38, ${0.1 + glowIntensity * 0.008}),
      inset 0 0 ${glowIntensity}px rgba(255, 200, 0, ${0.1 + glowIntensity * 0.005});
    background: radial-gradient(
      circle at center,
      rgba(255, 220, 100, ${0.05 + glowIntensity * 0.003}) 0%,
      rgba(255, 140, 0, ${0.02 + glowIntensity * 0.002}) 50%,
      transparent 100%
    );
  `);

	let fireBackdropStyle = $derived(`
    filter: blur(${sparkNums * 2}px)
      drop-shadow(0 0 ${sparkNums * 25}px rgba(255, 140, 0, 0.8))
      drop-shadow(0 0 ${sparkNums * 40}px rgba(220, 38, 38, 0.6));
    transform: scale(${1 + sparkNums * 0.05});
    opacity: ${0.6 + sparkNums * 0.05};
  `);

	let fireIconStyle = $derived(`
    filter:
      drop-shadow(0 2px 8px rgba(255, 200, 0, 0.9))
      drop-shadow(0 4px 16px rgba(255, 100, 0, 0.7))
      drop-shadow(0 0 ${glowIntensity}px rgba(220, 38, 38, 0.5))
      drop-shadow(0 -2px 12px rgba(255, 220, 0, 0.6));
    transform: scale(${1.1 + glowIntensity * 0.005});
  `);

	let streakNumberStyle = $derived(`
   /* text-shadow:
      0 0 10px rgba(255, 200, 0, 0.8),
      0 0 20px rgba(255, 140, 0, 0.6),
      0 2px 4px rgba(0, 0, 0, 0.3),
      0 0 ${glowIntensity}px rgba(220, 38, 38, 0.4);
    transform: scale(${1 + glowIntensity * 0.003});*/
  `);
</script>

<div
	class="relative h-full overflow-visible rounded-lg bg-white shadow-md transition-all duration-300"
	style={containerGlow}
>
	<div
		class="animate-flicker pulse-glow relative flex min-h-20 flex-row items-center justify-center gap-10 px-3 py-3 text-2xl font-bold select-none"
		style="animation-duration: {1.5 - Math.min(streak * 0.02, 0.5)}s;"
	>
		<div class="pointer-events-none absolute inset-0 -z-10" style={fireBackdropStyle}></div>

		<span
			class="z-10 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-600 bg-clip-text text-7xl text-transparent"
			style={streakNumberStyle}
		>
			{streak}
		</span>

		<svg
			viewBox="0 0 512 512"
			class="z-10 h-14 w-14 shrink-0"
			style={fireIconStyle}
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="fireGradient" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#fde047" />
					<stop offset="40%" stop-color="#fb923c" />
					<stop offset="100%" stop-color="#dc2626" />
				</linearGradient>
			</defs>
			<path fill="url(#fireGradient)" d={firePath} />
		</svg>

		{#each Array.from({ length: sparkNums }) as _, i (i)}
			<div
				class={'spark spark-' + i}
				style={'animation-delay: ' + i * 0.3 + 's; --spark-hue: ' + (40 - i * 5) + ';'}
			></div>
		{/each}
	</div>
</div>

<style>
	@keyframes flicker {
		0%,
		100% {
			opacity: 1;
			filter: brightness(1) contrast(1.1);
		}
		20% {
			opacity: 0.98;
			filter: brightness(1.2) contrast(1.15);
		}
		40% {
			opacity: 0.92;
			filter: brightness(1.1) contrast(1.12);
		}
		60% {
			opacity: 0.95;
			filter: brightness(1.25) contrast(1.18);
		}
		80% {
			opacity: 0.9;
			filter: brightness(1.15) contrast(1.14);
		}
	}

	@keyframes pulseGlow {
		0%,
		100% {
			box-shadow:
				0 0 15px rgba(255, 140, 0, 0.4),
				0 0 30px rgba(255, 69, 0, 0.3),
				0 0 45px rgba(220, 38, 38, 0.2);
		}
		50% {
			box-shadow:
				0 0 25px rgba(255, 140, 0, 0.6),
				0 0 50px rgba(255, 69, 0, 0.4),
				0 0 75px rgba(220, 38, 38, 0.3),
				0 0 100px rgba(255, 0, 0, 0.2);
		}
	}

	/* Ember spark animations - shooting upward and outward with rotation */
	@keyframes sparkFloat1 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(-35px, -95px) rotate(-15deg) scale(0.3);
			opacity: 0;
		}
	}

	@keyframes sparkFloat2 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(35px, -110px) rotate(20deg) scale(0.2);
			opacity: 0;
		}
	}

	@keyframes sparkFloat3 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(-20px, -120px) rotate(-25deg) scale(0.25);
			opacity: 0;
		}
	}

	@keyframes sparkFloat4 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(25px, -90px) rotate(10deg) scale(0.3);
			opacity: 0;
		}
	}

	@keyframes sparkFloat5 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(-28px, -105px) rotate(-20deg) scale(0.2);
			opacity: 0;
		}
	}

	@keyframes sparkFloat6 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(15px, -115px) rotate(30deg) scale(0.25);
			opacity: 0;
		}
	}

	@keyframes sparkFloat7 {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		100% {
			transform: translate(-10px, -100px) rotate(-10deg) scale(0.3);
			opacity: 0;
		}
	}

	@keyframes sparkFlicker {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	.spark {
		position: absolute;
		width: 4px;
		height: 8px;
		border-radius: 50% 50% 0 0;
		background: linear-gradient(
			to bottom,
			hsl(var(--spark-hue, 40), 100%, 70%) 0%,
			hsl(var(--spark-hue, 40), 100%, 60%) 30%,
			hsl(calc(var(--spark-hue, 40) - 10), 100%, 50%) 70%,
			transparent 100%
		);
		box-shadow:
			0 0 4px hsl(var(--spark-hue, 40), 100%, 60%),
			0 0 8px hsl(calc(var(--spark-hue, 40) - 10), 100%, 50%);
		pointer-events: none;
		animation-timing-function: ease-out;
	}

	.spark-0 {
		animation:
			sparkFloat1 2.5s linear infinite,
			sparkFlicker 0.3s ease-in-out infinite;
		left: 70%;
		top: 30%;
	}

	.spark-1 {
		animation:
			sparkFloat2 3s linear infinite,
			sparkFlicker 0.4s ease-in-out infinite;
		left: 55%;
		top: 35%;
		animation-delay: 0.4s;
	}

	.spark-2 {
		animation:
			sparkFloat3 2.2s linear infinite,
			sparkFlicker 0.35s ease-in-out infinite;
		left: 67%;
		top: 32%;
		animation-delay: 0.8s;
	}

	.spark-3 {
		animation:
			sparkFloat4 2.8s linear infinite,
			sparkFlicker 0.45s ease-in-out infinite;
		left: 63%;
		top: 38%;
		animation-delay: 1.2s;
	}

	.spark-4 {
		animation:
			sparkFloat5 3.2s linear infinite,
			sparkFlicker 0.3s ease-in-out infinite;
		left: 62%;
		top: 33%;
		animation-delay: 1.6s;
	}

	.spark-5 {
		animation:
			sparkFloat6 2.6s linear infinite,
			sparkFlicker 0.4s ease-in-out infinite;
		left: 67%;
		top: 36%;
		animation-delay: 2s;
	}

	.spark-6 {
		animation:
			sparkFloat7 2.9s linear infinite,
			sparkFlicker 0.35s ease-in-out infinite;
		left: 63%;
		top: 34%;
		animation-delay: 2.4s;
	}

	.spark-7 {
		animation:
			sparkFloat1 3.1s linear infinite,
			sparkFlicker 0.5s ease-in-out infinite;
		left: 59%;
		top: 37%;
		animation-delay: 2.8s;
	}
</style>
