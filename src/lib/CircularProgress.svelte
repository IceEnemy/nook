<script>
    export let type = 'work'
    export let seconds = 900 ;
    export let totalSeconds = 1200;

    let progress = seconds / totalSeconds;

	const angle = 360 * progress
	
    let minutes = Math.floor(seconds / 60);
    let secondsLeft = seconds % 60;

	// Adapt the logic according to the approach
	const	background = `radial-gradient(var(--seasalt) 57%, transparent 45%),
    conic-gradient(transparent 0deg ${angle}deg, var(--dim_linen) ${angle}deg 360deg),
    var(--chamoisee)`;
	
	$: cssVarStyles = `--background:${background}`
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
}
h1 {
    font-size: 4rem;
    font-weight: 500;
    margin: 0;
}
</style>

<div id="progress-circle" style="{cssVarStyles}">
    {#if type === 'work'}
        <span class="carbon--book medium-icon"></span>
        <h2>Time to work!</h2>
        <h1>
            {minutes < 10 ? `0${minutes}` : minutes}:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
        </h1>
    {:else}
        <h2>Break</h2>
    {/if}
</div>