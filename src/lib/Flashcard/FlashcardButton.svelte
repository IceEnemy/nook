<script>
	function showAnswer() {
		console.log('Show Answer button clicked');
	}

	function skipQuestion() {
		console.log('Skip button clicked');
	}

	export let currentNum;
	export let totalNum;
</script>

<div id="option-box">
	<button id="show-ans" on:click={() => showAnswer()}>Show Answer</button>
	<h5 id="question-number">{currentNum} out of {totalNum}</h5>
	<button id="skip" on:click={() => skipQuestion()}>Skip</button>
</div>

<style>
	#option-box {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-top: auto;
	}

	button {
		width: 40%;
		padding-block: 10px;
		font-size: 16px;
	}

	#show-ans {
		background-color: var(--dim_linen);
		border-radius: 0;
		border: none; /* Remove the border */
	}

	#skip {
		border: 1px solid var(--coyote);
	}

	#show-ans,
	#skip {
		color: var(--coyote);
		border-radius: 16px;
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
</style>
