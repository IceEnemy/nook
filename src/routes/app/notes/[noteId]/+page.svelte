<script>
	import RichTextEditor from '$lib/RichTextEditor.svelte';
	import { page } from '$app/stores';
	import { authStore } from '$lib/store/store';
	$: username = $authStore.data.username;
	$: uid = $authStore.user.uid;
	$: noteId = $page.params.noteId;
	// let dataGot = false;
	// console.log(uid)
</script>

{#if !$authStore.loading}
	<!-- <div id="userlist"></div> -->
	<RichTextEditor {username} {uid} {noteId} />
{/if}
