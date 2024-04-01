<script>
    import NotePreview from '$lib/noteNav.svelte';

    export let expanded = false;
    export let name;
    export let notes;

    function toggle(){
        expanded = !expanded;
    }

	console.log("Folder notes: ", notes);
</script>

<button class:expanded on:click={toggle}>{name}</button>

{#if expanded}
    <ul>
        {#each notes as note}
            <li>
                {#if note.type === 'note'}
                    <NotePreview title={note.title} />
                {:else}
                    <svelte:self name={note.title} notes={note.notes} />
                {/if}
            </li>
        {/each}
    </ul>

{/if}

<style>
	button {
		padding: 0 0 0 1.5em;
		/* background: url(/tutorial/icons/folder.svg) 0 0.1em no-repeat; */
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
		border: none;
		margin: 0;
	}

	.expanded {
		/* background-image: url(/tutorial/icons/folder-open.svg); */
	}

	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid #eee;
	}

	li {
		padding: 0.2em 0;
	}
</style>