<script>
	async function handleLogout() {
		await fetch('/auth/logout', {
			method: 'POST'
		});
		window.location.href = '/';
	}
</script>

<button on:click={handleLogout}> Log Out </button>
