<script>
	import Flashcards from '$lib/Flashcards.svelte';
	import { page } from '$app/stores';
	$: flashcardId = $page.params.flashcardId;
</script>

<div class="header">
	<h1>Flashcard</h1>
</div>

<div>
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
</style>
