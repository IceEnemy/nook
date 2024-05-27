<script>
	import { doc, getDoc } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import FlashcardButton from './Flashcard/FlashcardButton.svelte';

	let currentNum = 1;
	let totalNum = 10;
	let flashcardName = '';
	let mode = '';

	let gotData = false;

	export let flashcardId;
	console.log(flashcardId);

	// Reference to the flashcard document in Firestore
	const flashcardRef = doc(db, 'flashcards', flashcardId);
	getDoc(flashcardRef)
		.then((doc) => {
			if (doc.exists()) {
				const flashcardData = doc.data();
				gotData = true;
				mode = 'question';
				flashcardName = flashcardData.title;
				console.log('Flashcard name:', flashcardName);
			} else {
				console.log('No such document!');
			}
		})
		.catch((error) => {
			console.error('Error getting document:', error);
		});

	// change the values of qtype-title and qtype based on the type of question
	// and the id question h3 value

	function handleTitle() {
		const questionType = document.getElementById('qtype');
		const question = document.getElementById('question');
		const mainBox = document.getElementById('main-box');
		const qtypeTitle = document.getElementById('qtype-title');
		const qtype = document.getElementById('qtype');
		const optionBox = document.getElementById('option-box');
	}
</script>

{#if gotData}
	<div class="flashcard-gridbox">
		<h2 id="flashcard-title">{flashcardName}</h2>
		<div class="grid">
			<div class="title">
				<h3 id="qtype-title">QUESTION</h3>
				<h5 id="qtype">Open-Ended Question / Closed Question</h5>
			</div>
			<div id="main-box">
				<h3 id="question">What is the weight of mars</h3>
			</div>

			<FlashcardButton {currentNum} {totalNum} />
		</div>
		{#if mode === 'question'}
			console.log('Question mode');
		{:else if mode === 'answer'}
			console.log('Answer mode'); 
		{/if}
	</div>
{/if}

<style>
	.grid {
		background-color: var(--seasalt);
		border: 1px solid var(--dun);
		padding: 24px;
		border-radius: 32px; /* Rounded corners */
		width: 1000px; /* Need to fix Im so dumb with css */
	}

	.flashcard-gridbox {
		display: grid;
		justify-content: center;
		align-items: start;
		grid-template-rows: auto auto 1fr auto;
		text-align: center;
		row-gap: 20px;
		padding: 20px;
		height: calc(100vh - 120px);
		width: 100%;
		margin: 52px auto;
	}

	#flashcard-title {
		color: var(--buff);
		text-align: left;
		font-size: 2rem;
	}

	.title {
		display: grid;
		justify-content: center;
		align-items: center;
	}

	#qtype-title {
		margin: 0;
	}
	#qtype {
		margin-top: 16px;
		color: var(--chamoisee);
	}

	#main-box {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#question {
		margin: 20% 20%;
	}
</style>
