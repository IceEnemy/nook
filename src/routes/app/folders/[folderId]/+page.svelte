<script>
	import FileView from '$lib/NoteAccess/FileView.svelte';
	import { page } from '$app/stores';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { onMount, onDestroy } from 'svelte';

	$: ref = $page.params.folderId;

	$: folderName = '';

	onMount(async ($page) => {
		if (ref) {
			let docRef = doc(db, 'folders', ref);
			try {
				const folder = await getDoc(docRef);
				if (folder.exists()) {
					folderName = folder.data().title;
				} else {
					console.log('No such document!');
				}
			} catch (error) {
				console.error('Error getting document:', error);
			}
		}
	});
</script>

<div class="upper">
	<h1>{folderName}</h1>
</div>
<FileView {ref} />

<style>
	h1 {
		font-size: 3rem;
		color: var(--text_high_contrast);
		font-weight: 300;
	}
	.upper {
		height: 3rem;
		width: 100%;
		margin-bottom: 1.5rem;
	}
</style>
