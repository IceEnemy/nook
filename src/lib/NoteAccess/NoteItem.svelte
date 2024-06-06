<script>
	import { goto } from '$app/navigation';

	export let note;

	function handleClick() {
		goto(`/app/notes/${note.noteId}`, { replaceState: true });
		// location.reload();
	}

	$: console.log('Note:', note);
</script>

<button class="note-button" on:click={handleClick}>
	{note.title ? note.title : 'Untitled'}
</button>

<style>
	.note-button {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0.5rem;
		cursor: pointer;
		color: var(--text-color);
	}
</style>
