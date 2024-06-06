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
	.folder-header {
		cursor: pointer;
		padding: 0.5rem;
		background-color: none;
		border-radius: 4px;
	}

	.folder-content {
		padding-left: 1rem;
	}
</style>
