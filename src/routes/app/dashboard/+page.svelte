<script>
    // import {onMount, getContext} from 'svelte';
    import {authHandlers, authStore, updateNoteStore} from '$lib/store/store';
    import Folder from '$lib/Folder.svelte';
    // import {auth}  from '$lib/firebase/firebase.js';


    $: username = $authStore.data?.username || 'Loading..';
    $: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';
    $: notes = $authStore.data?.notes || [];

    $: console.log(notes);

    let path = [];

    async function handleAddNote(){
        await updateNoteStore.newNote("new", path, "note");
    }
    async function hadleAddFolder(){
        await updateNoteStore.newNote("newFolder", path, "folder");
    }

    async function handleFolderAddNote(){
        path.push('newFolder');
        console.log(path)
        handleAddNote();
        path.pop()
    }

    async function handleFolderNested(){
        path.push('newFolder');
        console.log(path)
        hadleAddFolder();
        path.pop()
    }

    async function handleNestedNestedNote(){
        path.push('newFolder');
        console.log(path)
        handleFolderAddNote();
        path.pop()
    }

    import RichTextEditor from '$lib/RichTextEditor.svelte';
    
</script>

<!-- <h1>Hey, {username} </h1>

<button on:click={authHandlers.logout}>logout</button>

<img src={profilePic} alt="Profile Pic" /> -->

<!-- <RichTextEditor /> -->

{#if notes.length > 0}
    <Folder name="Notes" notes={notes} expanded={false} />
{/if}

<button on:click={handleAddNote}>heyaa</button>
<button on:click={hadleAddFolder}>Folder</button>
<button on:click={handleFolderAddNote}>NestedTest</button>
<button on:click={handleFolderNested}>NestedFolder</button>
<button on:click={handleNestedNestedNote}>NestedNestedNote</button>



