<script>
	import RichTextEditor from '$lib/RichTextEditor.svelte';
	import { page } from '$app/stores';
	import { authStore } from '$lib/store/store';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { onMount, onDestroy } from 'svelte';

	$: username = $authStore.data.username;
	$: uid = $authStore.user.uid;
	$: noteId = $page.params.noteId;

	$: ref = $page.params.noteId;
	$: noteName = '';

	onMount(async ($page) => {
		if (ref) {
			let docRef = doc(db, 'notes', ref);
			try {
				const notes = await getDoc(docRef);
				if (notes.exists()) {
					noteName = note.data().title;
				} else {
					console.log('No such document!');
				}
			} catch (error) {
				console.error('Error getting document:', error);
			}
		}
	});
</script>

{#if !$authStore.loading}
	<!-- <div id="userlist"></div> -->
	<RichTextEditor {username} {uid} {noteId} />
{/if}

