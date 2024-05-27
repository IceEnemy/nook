<script>
	// import {onMount, getContext} from 'svelte';
	import { authHandlers, authStore } from '$lib/store/store';
	import { updateFlashcardStore } from '$lib/store/flashcard';
	import FlashcardView from '$lib/Flashcard/FlashcardView.svelte';
	// import {auth}  from '$lib/firebase/firebase.js';

	$: username = $authStore.data?.username || 'Loading..';
	$: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';
	$: flashcards = $authStore.data?.flashcards || [];
	$: loading = $authStore.loading;
</script>

<div class="upper">
	<h1>Welcome, <span class="bold">{username}</span></h1>
</div>
{#if !loading}
	<FlashcardView />
{/if}

<div id="firepad"></div>

<style>
	h1 {
		font-size: 3rem;
		color: var(--text_high_contrast);
		font-weight: 300;
	}
	.bold {
		font-weight: bold;
	}
	.upper {
		height: 3rem;
		width: 100%;
		margin-bottom: 1.5rem;
	}
</style>
