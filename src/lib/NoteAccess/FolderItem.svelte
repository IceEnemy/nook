<script>
	import NoteItem from './NoteItem.svelte';

	export let folder;

	let isOpen = false;

	function toggle() {
		isOpen = !isOpen;
	}

	$: console.log('Folder:', folder);
</script>

<div class="folder">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="folder-header" on:click={toggle}>
		<span class="material-symbols--folder icon2"></span>
		{folder.name}
	</div>
	{#if isOpen}
		<div class="folder-content">
			{#each folder.notes as note}
				<NoteItem {note} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.icon2 {
		width: 1em;
		height: 1em;
		margin-right: 0.5rem;
	}
	.folder {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.folder-header {
		cursor: pointer;
		padding: 0.5rem 0.5rem 0.5rem 0;
		background-color: none;
		border-radius: 4px;

		display: flex;
		align-items: center;
	}

	.folder-content {
		padding-left: 1rem;
	}
</style>
