<script>
	import { goto } from '$app/navigation';

	export let note;

	function handleClick() {
		handleRedirect();
	}

	async function handleRedirect() {
		await goto(`/app/notes/${note.noteId}`, { replaceState: true });
		// location.reload();
	}

	// $: console.log('NoteItem:', note);
</script>

<button class="note-button" on:click={handleClick}>
	<span class="mingcute--file-fill icon2"></span>
	<p>{note.title ? note.title : 'Untitled'}</p>
</button>

<style>
	.note-button p {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex-grow: 1;
	}
	.note-button {
		/* display: block; */
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0.5rem 0.5rem 0.5rem 0;
		cursor: pointer;
		color: var(--text-color);

		display: flex;
		align-items: center;
	}
	.icon2 {
		width: 1em;
		height: 1em;
		margin-right: 0.5rem;
		min-width: 1em;
	}
</style>
