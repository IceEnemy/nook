<script>
	import Flashcards from '$lib/Flashcard/Flashcards.svelte';
	import { page } from '$app/stores';
	$: flashcardId = $page.params.flashcardId;
</script>

<div class="header">
	<h1>Flashcard</h1>
</div>

<div class="flashcard-container">
	<Flashcards {flashcardId} />
</div>

<style>
	.header {
		color: var(--default_white);
		position: absolute;
		display: flex;
		align-items: center;
		height: 90px;
		width: calc(100vw - 18rem);
		padding-left: 40px;
		top: 0;
		left: 0;
		background-color: var(--darker_van_dyke);
	}
	.flashcard-container {
		margin-top: 65px; /* Adjust margin-top to create space below the header */
	}
</style>
