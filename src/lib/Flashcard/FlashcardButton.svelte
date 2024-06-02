<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let totalCorrectNum;
	export let originalTotalNum;
	export let showAnswerMode = false;

	function showAnswer() {
		dispatch('showanswer');
	}

	function handleYes() {
		dispatch('yes');
	}

	function handleNo() {
		dispatch('no');
	}

	function skipQuestion() {
		dispatch('skipquestion');
	}
</script>

<div id="option-box">
	{#if showAnswerMode}
		<button class="button-yes" on:click={handleYes}>Yes, I got it right!</button>
		<h5 class="option-info">{totalCorrectNum} out of {originalTotalNum}</h5>
		<button class="button-no" on:click={handleNo}>Oh snap...</button>
	{:else}
		<button id="show-ans" on:click={showAnswer}>Show Answer</button>
		<h5 class="option-info">{totalCorrectNum} out of {originalTotalNum}</h5>
		<button id="skip" on:click={skipQuestion}>Skip</button>
	{/if}
</div>

<style>
	#option-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		margin-top: auto;
	}

	.option-info {
		margin: 0; /* Reset margin */
		text-align: center; /* Center text horizontally */
	}

	button {
		padding-block: 10px;
		font-size: 16px;
		color: var(--coyote);
		border-radius: 16px;
		width: 30vw;
	}

	#show-ans {
		background-color: var(--dim_linen);
		border: none;
		padding: 10px 20px; /* Adjust padding for button width */
	}

	#skip {
		background-color: transparent;
		border: 1px solid var(--coyote);
		padding: 10px 20px; /* Adjust padding for button width */
	}

	.button-yes {
		background-color: var(--yellow_green);
	}

	.button-no {
		background-color: var(--off_red);
	}

	.button-no,
	.button-yes {
		color: var(--default_white);
		padding: 10px 20px; /* Adjust padding for button width */
		border: none;
	}

	#show-ans:hover {
		background-color: var(--light_orange);
	}

	#show-ans:active {
		background-color: var(--fawn);
	}

	#skip:hover {
		background-color: var(--dim_linen);
	}

	#skip:active {
		background-color: var(--almond);
	}

	#skip:active,
	#skip:hover {
		border: 1px solid var(--buff);
	}

	.button-yes {
		background-color: var(--yellow_green);
		color: var(--default_white);
		border: none;
	}

	.button-yes:hover {
		background-color: var(--dark_yellow_green);
	}

	.button-yes:active {
		background-color: var(--apple_green);
	}

	/* Adjust widths and flex-grow */
	.button-yes,
	.button-no,
	#show-ans,
	#skip {
		flex-grow: 1; /* Make buttons fill remaining space */
	}
</style>
