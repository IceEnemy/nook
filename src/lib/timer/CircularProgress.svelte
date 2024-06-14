<script>
    import { timerState, globalWorkTime, globalBreakTime, timer } from '$lib/store/timer.js';

    export let type = "working";
    export let totalSeconds;
    export let seconds;
    export let chosen = true;

    // Default values for progress calculation
    let progress = 1;
    let angle = 360;
    let minutes = 0;
    let secondsLeft = 0;
    let background = '';
    let cssVarStyles = '';

    function updateProgress() {
        progress = seconds / totalSeconds;
        angle = 360 * progress;
        minutes = Math.floor(seconds / 60);
        secondsLeft = seconds % 60;
        background = `radial-gradient(var(--seasalt) 57%, transparent 45%),
                      conic-gradient(transparent 0deg ${angle}deg, var(--dim_linen) ${angle}deg 360deg),
                      var(--chamoisee)`;
        cssVarStyles = `--background:${background}`;
    }

    // Reactive statement to update values from stores if props are not provided
    $: {

            if(chosen){
                type = $timerState;
                totalSeconds = type === 'working' ? $globalWorkTime : $globalBreakTime;
                seconds = $timer;
            }
            
        updateProgress();
    }
</script>

<style>
#progress-circle {
    display: flex;
    flex-direction: column;
    background: var(--background);
    border-radius: 50%;
    width: 360px;
    height: 360px;
    transition: all 500ms ease-in;
    will-change: transform;
    align-self: center;
    justify-content: center;
    align-items: center;
    color: var(--darker_van_dyke);
}
h1 {
    font-size: 4rem;
    font-weight: 500;
    margin: 0;
}
</style>

<div id="progress-circle" style="{cssVarStyles}">
    {#if type === 'working'}
        <span class="carbon--book medium-icon"></span>
        <h2>Time to work!</h2>
        <h1>
            {minutes < 10 ? `0${minutes}` : minutes}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
        </h1>
    {:else}
        <span class="codicon--coffee medium-icon"></span>
        <h2>Take a break!</h2>
        <h1>
            {minutes < 10 ? `0${minutes}` : minutes}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
        </h1>
    {/if}
</div>
