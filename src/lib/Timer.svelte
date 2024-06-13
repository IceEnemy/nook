<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import CircularProgress from '$lib/CircularProgress.svelte';

    import {doc, addDoc, collection, setDoc, getDoc} from 'firebase/firestore';
    import {db, auth} from '$lib/firebase/firebase.js';
    import {authStore} from '$lib/store/store.js';   
    import {isRunning, timerId, timer, globalWorkTime, globalBreakTime, lapLimit, lapCount, startTimer, stopTimer, resetTimer, timerState, updateLapCount, updateTimerTitle, updateTime} from '$lib/store/timer.js';

    export let id;
    export let name = 'Pomodoro Timer';
    export let lapAmount = 2;
    // export let state = 'paused';
    export let workTime = 1500;
    export let breakTime = 300;

    let lapProgress;

    let inputElement;
    const inputWidth = writable('auto');

    function handleStart(){

        timerId.set(id);
        globalWorkTime.set(workTime);
        globalBreakTime.set(breakTime);
        lapLimit.set(lapAmount);
        startTimer();
    }

    function adjustInputWidth() {
        if (inputElement) {
            const span = document.createElement('span');
            span.style.visibility = 'hidden';
            span.style.position = 'absolute';
            span.style.whiteSpace = 'pre';
            span.textContent = name;
            document.body.appendChild(span);

            inputWidth.set(`${span.offsetWidth}px`);

            document.body.removeChild(span);
        }
    }

    function parseSeconds(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes < 10 ? '0':''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    async function handleSubmit(event, type) {
    event.preventDefault();
    const input = event.target.querySelector('input').value.trim();
    const inputElement = event.target.querySelector('input');

        function parseInputToSeconds(input) {
            // Check if input is an integer
            if (/^\d+$/.test(input)) {
                return parseInt(input) * 60;
            }

            // Check if input is in time format (min:sec)
            const timeFormat = /^(\d{1,2}):([0-5]?\d)$/;
            const match = input.match(timeFormat);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                return minutes * 60 + seconds;
            }

            // Invalid input
            return null;
        }

        const parsedSeconds = parseInputToSeconds(input);
        if (parsedSeconds === null) {
            console.error('Invalid input format');
            return;
        }

        inputElement.blur(); // Blur the input field
        await saveTimeSettings(type, parsedSeconds);
    }

    $: workInput = parseSeconds(workTime);
    $: breakInput = parseSeconds(breakTime);

    const showWorkPlaceholder = writable(false);
    const showBreakPlaceholder = writable(false);

    function handleWorkFocus() {
        showWorkPlaceholder.set(true);
    }

    function handleWorkBlur() {
        showWorkPlaceholder.set(false);
    }

    function handleBreakFocus() {
        showBreakPlaceholder.set(true);
    }

    function handleBreakBlur() {
        showBreakPlaceholder.set(false);
    }

    $: workInputDisplay = $showWorkPlaceholder ? '' : workInput;
    $: breakInputDisplay = $showBreakPlaceholder ? '' : breakInput;

    let enterPressed = false;

    async function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            enterPressed = true;
            saveName();
            inputElement.blur();
        }
    }

    async function handleBlur() {
        if (!enterPressed) {
            saveName();
        }
        enterPressed = false; // Reset flag after blur event
    }

    async function handleLaps(op) {
        if (op === 'minus' && lapAmount > 2) {
            await updateLapCount(id,-1);
            lapAmount--;
        } else if (op === 'plus' && lapAmount < 5) {
            await updateLapCount(id,1);
            lapAmount++;
        }
    }

    async function saveTimeSettings(type, time) {

        if (type === 'working') {
            workTime = time;
            await updateTime(time,id,'workTime')
        } else if (type === 'break') {
            breakTime = time;
            await updateTime(time,id,'breakTime')
        }
        console.log(`Saving time settings for ${type}`);
        
    }

    async function saveName() {
        await updateTimerTitle(name, id);
        console.log(`Saving name: ${name}`);
    }

    // Adjust the input width initially
    onMount(() => {
        adjustInputWidth();
    });

    // Reactively adjust the input width when the name changes
    $: name, adjustInputWidth();
</script>

<div class="timerBody">
    <input type="text" class="timerName" bind:value={name} bind:this={inputElement} style="width: {$inputWidth}" on:input={adjustInputWidth} on:blur={handleBlur} on:keydown={handleKeyDown}>
    <h2>Laps</h2>
    <div class="lapsContainer">
        <button class="lapButton" on:click={() => { handleLaps('minus') }}>-</button>
        <div class="laps" style="gap: calc(30px - 5px * ({lapAmount} - 2))">
            {#if id === $timerId}
                {#each Array.from({ length: lapAmount }) as _, i}
                    <div class="lapCircle" style="background-color: {i < $lapCount ? 'var(--chamoisee)' : i === $lapCount ? 'var(--buff)' : 'var(--dim_linen)'};"></div>
                {/each}
            {:else}
                {#each Array.from({ length: lapAmount }) as _, i}
                    <div class="lapCircle" style="background-color: var(--dim_linen)"></div>
                {/each}
            {/if}
        </div>
        <button class="lapButton" on:click={() => { handleLaps('plus') }}>+</button>
    </div>

    <CircularProgress type="working" totalSeconds={workTime} seconds={workTime} chosen={$timerId === id}/>

    <div class="circularContainer">
        <button class="circularButton" on:click={resetTimer}><span class="iconamoon--restart icon"></span></button>
        <button class="circularButton" on:click={() => $isRunning? stopTimer() : handleStart()}>
            {#if $isRunning && $timerId === id} 
                <span class="f7--pause-fill icon"></span>
            {:else}
                <span class="ph--play-fill icon"></span>
            {/if}
        </button>
    </div>
    <div class="timeInputs">
        <div class="minInput">
            <div class="minTitle">
                <h3>Work</h3>
            </div>
            <form on:submit={() => handleSubmit(event,'working')}>
                <input type="text" bind:value={workInputDisplay} placeholder={workInput} class="timerMins" on:focus={handleWorkFocus} on:blur={handleWorkBlur}>
            </form>
        </div>
        <div class="minInput">
            <div class="minTitle">
                <h3>Break</h3>
            </div>
            <form on:submit={() => handleSubmit(event,'break')}>
                <input type="text" bind:value={breakInputDisplay} placeholder={breakInput} class="timerMins" on:focus={handleBreakFocus} on:blur={handleBreakBlur}>
            </form>
        </div>
    </div>
</div>

<style>
    .timerMins {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 82px;
        font-size: 2.5rem;
        border: none;
        background-color: var(--seasalt);
        border-radius: 0 0 10px 10px;
        text-align: center;
    }

    h2, h3 {
        align-self: center;
        justify-self: center;
        color: var(--darker_van_dyke);
    }

    .timeInputs {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 80%;
        align-self: center;
    }

    .minInput {
        display: flex;
        flex-direction: column;
        width: 140px;
        height: 112px;
        border-radius: 10px;
        border: 1px solid var(--desert_sand);
    }

    .minTitle {
        display: flex;
        border-radius: 10px 10px 0 0;
        background-color: var(--dim_linen);
        height: 30px;
        justify-content: center;
        align-items: center;
    }

    .lapsContainer {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 80%;
        align-self: center;
    }

    .circularContainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 100px;
    }

    .lapButton, .circularButton {
        background-color: var(--dim_linen);
        border: none;
        border-radius: 5px;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    .circularButton {
        border-radius: 50%;
        width: 40px;
        height: 40px;
    }

    .laps {
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex-grow: 1;
        margin: 0 10px;
        flex-wrap: wrap;
        animation: none;
        transition: none;
    }

    .lapCircle {
        /* background-color: var(--desert_sand); */
        border-radius: 50%;
        height: 32px;
        width: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .timerBody {
        display: flex;
        flex-direction: column;
        background-color: var(--seasalt);
        border: 1px solid var(--desert_sand);
        border-radius: 30px;
        height: 725px;
        width: 400px;
        gap: 1rem;
    }

    .timerName {
        font-size: 1rem;
        background-color: transparent;
        border: none;
        height: calc(1rem + 5px);
        margin-left: 20px;
        margin-top: 20px;
        min-width: 5rem;
        animation: none;
        transition: none;
        color: var(--chamoisee);
        padding-bottom: 5px;
    }

    .timerName:focus {
        border-bottom: 2px solid var(--desert_sand);
    }
</style>
