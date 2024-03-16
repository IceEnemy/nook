<script>
    import {onMount, onDestroy} from 'svelte';
    import {authHandlers, showModal} from '$lib/store/store';
    import {auth}  from '$lib/firebase/firebase.js';
    import { goto } from '$app/navigation';
    import {authStore} from '$lib/store/store.js';
    import OptionButton from '$lib/assets/OptionButton.svelte'
    import NookLogo from '$lib/assets/NookLogo.svelte'

    //if authStore is changed, then these variables will dynamically update
    $: username = $authStore.data?.username || 'Loading..';
    $: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';

</script>

<nav class="navbar">
    <NookLogo/>
    <div class="accountNav">
        <div class="accountCred">
            <img class="imgContainer" src="{profilePic}" alt="">
            <p>{username}</p>
        </div>
        <OptionButton/>    
    </div>
</nav>


<style>

    .imgContainer{
        width: 2.5rem;
        height: 2.5rem;
    }

    .accountCred{
        display:flex;
        align-items: center;
        gap: 0.5rem;
    }

    .navbar{
        width:18rem;
        height: 100vh;
        padding-left:2rem;
        padding-top: 3rem;
        position:fixed;
        background-color: var(--sec_clr);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    .accountNav{
        position: absolute;
        bottom: 0; /* Align to bottom */
        left: 0; /* Align to the left edge of navbar */
        width: 100%; /* Ensure it spans the full width of navbar */
        padding: 1rem; /* Apply padding here, adjust as needed */
        background-color: var(--prim_clr);
        box-sizing: border-box; /* Ensures padding is included in the element's size */
        height:4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>