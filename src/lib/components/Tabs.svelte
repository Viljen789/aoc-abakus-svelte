<script lang="ts">
	import type { Component } from 'svelte';

	let { activeTab = $bindable(), icons } = $props<{ activeTab: number; icons: Component }>();
	const setTab = (e: number) => {
		activeTab = e;
	};
</script>

<div>
	{#each icons as Icon, i (Icon)}
		<button onclick={() => setTab(i)} class="bg-red-100">
			<Icon />
		</button>
	{/each}
</div>
