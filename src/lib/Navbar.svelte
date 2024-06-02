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

    let starredNotes = ['Note 1', 'Note 2', 'Note 3'];
    let recentlyContacted = ['Alice', 'Bob', 'Charlie'];

    const navOption1 = [
        { name: 'Dashboard', icon: 'material-symbols-light--dashboard-outline' },
        { name: 'Notifications', icon: 'material-symbols--inbox' },
        { name: 'Calendar', icon: 'mdi--calendar' },
        { name: 'Contacts', icon: 'lucide--contact-round' }
    ];

    const navOption2 = [
        { name: 'Flashcards', icon: 'mdi--cards-outline' },
        { name: 'Pomodoro', icon: 'gis--timer' },
        { name: 'Music', icon: 'flowbite--list-music-solid' }
    ];

    function navigateTo(section) {
        console.log(`Navigating to ${section}`);
        // Use goto function here if needed
        goto(`/app/${section.toLowerCase()}`);
    }

</script>

<nav class="navbar">
    <div class="logo">
        <NookLogo/>
    </div>
    
    <ul class="navSection">
        <h2 class="sectionTitle">Overview</h2>
        {#each navOption1 as option}
            <button on:click={() => navigateTo(option.name)}>
                <span class={option.icon}></span> {option.name}
            </button>
        {/each}
    </ul>
    <ul class="navSection">
        <h2 class="sectionTitle">Productivity Tools</h2>
        {#each navOption2 as option}
            <button on:click={() => navigateTo(option.name)}>
                <span class={option.icon}></span> {option.name}
            </button>
        {/each}
    </ul>
    <ul class="navSection">
        <h2 class="sectionTitle">Starred</h2>
        {#each starredNotes as note}
            <li>{note}</li>
        {/each}
    </ul>
    <ul class="navSection">
        <h2 class="sectionTitle">Recently Contacted</h2>
        {#each recentlyContacted as contact}
            <li>{contact}</li>
        {/each}
    </ul>
    <div class="accountNav">
        <div class="accountCred">
            <img class="imgContainer" src="{profilePic}" alt="">
            <p>{username}</p>
        </div>
        <OptionButton/>    
    </div>
</nav>
<div class="toolsBar">hey</div>

<style>

    /* .toolsBar{
        width: 30rem;
        height: 20rem;
        position: fixed;
        left: 18rem;
        z-index: 100;
        background-color: var(--navbar_bg);
    } */

    h2{
        font-size: 1.2 rem;
        color: var(--yellow_green);
    }

    .logo{
        margin-bottom: 1rem;
    }

    .navSection{
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .navSection button {
        /* color: black; */
        padding: 5px;
        background-color: transparent;
        color: var(--default_white);
        width: 100%;
        border: none;
        display: flex;
        text-align: left;
        gap: 5px;
        /* justify-content: center; */
        align-items: center;
    }

    .navSection button:hover{
        background-color: var(--navbar_bg_darker);
    }

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
        gap: 1rem;
        position:fixed;
        background-color: var(--navbar_bg);
        color: var(--default_white);
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
        background-color: var(--navbar_bg_darker);
        color: var(--default_white);
        box-sizing: border-box; /* Ensures padding is included in the element's size */
        height:4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>