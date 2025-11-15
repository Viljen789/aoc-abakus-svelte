<script lang="ts">
	import { Check, Copy } from 'lucide-svelte';

	let data = $props();
	const textToCopy: string = '2579356-71f0d9b5';
	let copyStatus = $state<string>('');
	let num = '2579356-71f0d9b5';

	async function copyText(): Promise<void> {
		try {
			await navigator.clipboard.writeText(textToCopy);
			copyStatus = 'Kopiert!';
			setTimeout(() => {
				copyStatus = '';
			}, 2000);
		} catch (err) {
			console.error('Klarte ikke kopiere', err);
			copyStatus = 'Klarte ikke kopiere tekst';
		}
	}
</script>

<div class="m-6 rounded-lg bg-yellow-50 p-8 shadow-md">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">Link din Abakus bruker til Advent of Code</h2>
	<div class="space-y-4 text-gray-700">
		<p>Klarte ikke finne en Advent of Code bruker linka til din abakus konto</p>
		<ol class="ml-4 list-inside list-decimal space-y-2">
			<li>
				Logg inn med <strong>GitHub </strong> kontoen din på
				<a href="https://adventofcode.com/2025/auth/login" class="text-blue-300">Advent of Code</a>
			</li>
			<li>
				<span class="flex items-center gap-1">
					Gå til <a href="https://adventofcode.com/2025/leaderboard/private" class="text-blue-300"
						>Leaderboards</a
					>
					og skriv inn
					<span
						class="flex cursor-pointer items-center gap-2 rounded-sm bg-gray-50"
						on:click={copyText}
					>
						{#if copyStatus}
							<code class="font-bold text-green-600">{copyStatus}</code>
						{:else}
							<code>{textToCopy}</code>
							<Copy size="16" />
						{/if}
					</span>
				</span>
			</li>
			<li>Pass på at du bruker samme github konto begge plasser</li>
			<li>Vent litt (Kan ta litt tid før den klarer å linke)</li>
		</ol>
		{#if data.user?.githubUsername}
			<p class="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
				<strong>Ditt github brukernavn: </strong>
				{data.user.githubUsername}
			</p>
		{:else}
			<p class="mt-4 rounded border border-red-200 bg-red-50 p-3">
				<strong>NB:</strong> DU HAR IKKE ANGITT GITHUB BRUKERNAVN PÅ ABAKUS, GÅ TIL
				<a href="https://abakus.no/users/me/settings/profile" class="text-blue-300"
					>PROFIL-INSTILLINGER</a
				> DIN OG LEGG INN GITHUB BRUKERNAVNET DITT.
			</p>
		{/if}
	</div>
</div>
