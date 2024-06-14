<script>
	import Call from '$lib/communication/Call.svelte';
	import { page } from '$app/stores';


	$: targetId = $page.params.targetId; 
</script>

<Call {targetId} />
