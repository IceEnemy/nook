<script>
    import { onMount, onDestroy } from 'svelte';
    import { authHandlers, showModal } from '$lib/store/store';
    import { auth } from '$lib/firebase/firebase.js';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/store/store.js';
    import OptionButton from '$lib/assets/OptionButton.svelte';
    import NookLogo from '$lib/assets/NookLogo.svelte';
    import { timerState, globalWorkTime, globalBreakTime, timer, isRunning, startTimer, stopTimer, resetTimer } from '$lib/store/timer.js';
    import { isPlaying, currentTrack, audioProgress, audioDuration, isLooping, isRandom, playPause, nextTrack, prevTrack, toggleLoop, toggleRandom, formatTime, songArr } from '$lib/store/music.js';

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
        goto(`/app/${section.toLowerCase()}`);
    }

    let isToolsBarOpen = true;

    function toggleToolsBar() {
        isToolsBarOpen = !isToolsBarOpen;
    }

    $: trackName = $currentTrack !== null ? songArr[$currentTrack].name : 'No Track Playing';
    $: timerMessage = $isRunning ? ($timerState === 'working' ? 'Time to work!' : 'Time to take a break!') : 'Timer not started!';
    $: timerProgress = $isRunning ? ($timerState === 'working' ? $timer / $globalWorkTime : $timer / $globalBreakTime) : 0;
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

<div class="toolsBar {isToolsBarOpen ? '' : 'closed'}">
    <button on:click={toggleToolsBar} class="toggleButton">
        {#if isToolsBarOpen}
            <span class="iconamoon--arrow-left-2-duotone icon"></span>
        {:else}
            <span class="iconamoon--arrow-right-2-duotone icon"></span>
        {/if}
    </button>
    <div class="content">
        <h2>Music</h2>
        <p>Playing: {trackName}</p>
        <div class="progressContainer">
            <button 
                on:click={toggleRandom} 
                class:is-active={$isRandom}>
                <p class="fa--random icon"></p>
            </button>
            <button on:click={prevTrack}><p class="fluent--previous-16-filled icon"></p></button>
            <button class="circularButton" on:click={playPause}>
                {#if $isPlaying}
                    <span class="f7--pause-fill icon"></span>
                {:else}
                    <span class="ph--play-fill icon"></span>
                {/if}
            </button>
            <button on:click={nextTrack}><p class="fluent--next-16-filled icon"></p></button>
            <button 
                on:click={toggleLoop} 
                class:is-active={$isLooping}>
                <p class="oi--loop icon"></p>
            </button>
        </div>
        <div class="progressContainer">
            <p>{formatTime($audioProgress)}</p>
            <progress max={$audioDuration} value={$audioProgress}></progress>
            <p>{formatTime($audioDuration)}</p>
        </div>
        <h2>Timer</h2>
        <div class="timeContainer">
            <p>{timerMessage}</p>
            <p>{formatTime($timer)}</p>
            <progress max="1" value={timerProgress}></progress>
        </div>
    </div>
</div>

<style>
    .toolsBar {
        width: 20rem;
        height: 15rem;
        position: fixed;
        left: 18rem;
        z-index: 100;
        background-color: var(--default_white);
        transition: transform 0.3s ease;
        transform: translateX(0);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        /* align-items: center; */
        text-align: center;
    }

    .toolsBar h2{
        color: var(--darker_van_dyke)
    }

    .toolsBar.closed {
        transform: translateX(-100%);
    }

    .toggleButton {
        position: absolute;
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        background-color: var(--navbar_bg_darker);
        color: var(--default_white);
        border: none;
        padding: 0.5rem;
        cursor: pointer;
    }

    .content {
        padding: 1rem;
    }

    h2 {
        font-size: 1.2 rem;
        color: var(--yellow_green);
    }

    .logo {
        margin-bottom: 1rem;
    }

    .navSection {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .navSection button {
        padding: 5px;
        background-color: transparent;
        color: var(--default_white);
        width: 100%;
        border: none;
        display: flex;
        text-align: left;
        gap: 5px;
        align-items: center;
    }

    .navSection button:hover {
        background-color: var(--navbar_bg_darker);
    }

    .imgContainer {
        width: 2.5rem;
        height: 2.5rem;
    }

    .accountCred {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .navbar {
        width: 18rem;
        height: 100vh;
        padding-left: 2rem;
        padding-top: 3rem;
        gap: 1rem;
        z-index: 101;
        position: fixed;
        background-color: var(--navbar_bg);
        color: var(--default_white);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }

    .accountNav {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 1rem;
        background-color: var(--navbar_bg_darker);
        color: var(--default_white);
        box-sizing: border-box;
        height: 4rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .progressContainer {
        width: 100%;
        margin-bottom: 5px;
        display: flex;
        flex-direction: row;
        gap: 20px;
        justify-content: center;
        align-items: center;
    }

    .progressContainer button:not(.circularButton){
        background: transparent;
        color: var(--darker_van_dyke); 
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .circularButton {
        background-color: var(--darker_van_dyke);
        color: var(--default_white);
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .is-active {
        color: var(--yellow_green);
    }

    progress {
        width: 70%;
        height: 10px;
        border-radius: 5px;
        -webkit-appearance: none;
        appearance: none;
    }

    progress::-webkit-progress-bar {
        background-color: var(--dim_linen);
        border-radius: 5px;
    }

    progress::-webkit-progress-value {
        background-color: var(--yellow_green);
        border-radius: 5px;
    }

    progress::-moz-progress-bar {
        background-color: var(--yellow_green);
        border-radius: 5px;
    }
</style>
