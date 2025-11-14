<script>
	const { data } = $props();
</script>

<details>
	<summary>API Data</summary>
	<div>
		{#if data.user}
			<div>
				<h3>Logged in User:</h3>
				<pre>{JSON.stringify(data.user, null, 2)}</pre>
				<p>GitHub Username: {data.user.githubUsername || '(not set)'}</p>
			</div>
		{:else}
			<p>Not logged in</p>
		{/if}
		<div>
			<h3>Matched Abakus Users:</h3>
			{#if data.members}
				<pre>{JSON.stringify(
						Object.values(data.members)
							.filter((m) => m.abakusUser)
							.map((m) => ({ aocName: m.name, abakusUser: m.abakusUser })),
						null,
						2
					)}</pre>
			{:else}
				<p>No member data available</p>
			{/if}
		</div>
	</div>
</details>
