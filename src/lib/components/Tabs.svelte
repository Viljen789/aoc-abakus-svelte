<script lang="ts">
	let { activeTab = $bindable(), labels } = $props<{ activeTab: number; labels: string[] }>();
	const setTab = (e: number) => {
		activeTab = e;
	};
</script>

<div>
	{#each labels as label, i (label)}
		<button onclick={() => setTab(i)}>
			{label}
		</button>
	{/each}
</div>
