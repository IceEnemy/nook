<script>
    // import {onMount, getContext} from 'svelte';
    import {authHandlers, authStore} from '$lib/store/store';
    // import {auth}  from '$lib/firebase/firebase.js';


    $: username = $authStore.data?.username || 'Loading..';
    $: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';
    
</script>

<h1>Hey, {username} </h1>

<button on:click={authHandlers.logout}>logout</button>

<img src={profilePic} alt="Profile Pic" />
