<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		const path = window.location.pathname;
		if (path === '/') {
			goto('/auth/access');
		}
	});
</script>
