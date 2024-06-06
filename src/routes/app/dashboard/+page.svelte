<script>
    // import {onMount, getContext} from 'svelte';
    import {authHandlers, authStore, updateNoteStore} from '$lib/store/store';
    import Folder from '$lib/Folder.svelte';
    import FileView from '$lib/NoteAccess/FileView.svelte';
    // import {auth}  from '$lib/firebase/firebase.js';


    $: username = $authStore.data?.username || 'Loading..';
    $: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';
    $: notes = $authStore.data?.notes || [];
    $: loading = $authStore.loading;

</script>
<div class="upper">
    <h1>Welcome, <span class="bold">{username}</span></h1>
</div>

{#if !loading}
    <FileView/>
{/if}

    

<style>
    h1{
        font-size: 3rem;
        color: var(--text_high_contrast);
        font-weight: 300;
    }
    .bold{
        font-weight: bold;
    }
    .upper{
        height: 3rem;
        width: 100%;
        margin-bottom: 1.5rem;
    }
</style> 


