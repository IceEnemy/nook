<script>
    import FileView from '$lib/NoteAccess/FileView.svelte';
    import { page } from '$app/stores';
    

    $: ref = $page.params.folderId;

</script>

<div class="upper">
    <h1>{ref}</h1>
</div>
<FileView {ref}/>

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