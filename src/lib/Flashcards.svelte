<script>
	import { onMount } from 'svelte';
	import { doc, getDoc, or } from 'firebase/firestore';
	import { db } from '$lib/firebase/firebase';
	import FlashcardButton from '$lib/Flashcard/FlashcardButton.svelte';

	let currentNum = 1;
	let flashcardName = '';
	let mode = 'Question';
	let questions = [];
	let tempQuestions = [];
	let gotData = false;
	let showAnswerMode = false;
	let originalTotalNum;
	let totalCorrectNum = 1;

	// Variables to store the current question, answer, and open status
	let currentQuestion = '';
	let currentAnswer = '';
	let currentOpen = false;
	let questionType = '';

	export let flashcardId;

	onMount(async () => {
		const docRef = doc(db, 'flashcards', flashcardId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const data = docSnap.data();
			flashcardName = data.title;
			questions = data.questions;

			tempQuestions = [...questions]; // Copy questions to temp array
			randomizeQuestions(); // Randomize the order of questions
			originalTotalNum = tempQuestions.length;
			console.log(originalTotalNum); // Debugging: Log the original total number of questions
			console.log('Questions:', questions); // Debugging: Log the questions array

			fillArrays()
				.then(() => {
					gotData = true;
					console.log('Data loaded and arrays filled');
					if (tempQuestions.length > 0) {
						currentNum = 1; // Ensure currentNum is set to 1 to trigger reactive statements
					}
				})
				.catch((error) => {
					console.error('Error filling arrays:', error);
					gotData = false; // Consider setting to false or handling error state
				});
		} else {
			console.log('Document does not exist'); // Debugging: Log if document does not exist
		}
	});

	function fillArrays() {
		return new Promise((resolve, reject) => {
			try {
				resolve();
			} catch (error) {
				reject(error);
			}
		});
	}

	function randomizeQuestions() {
		for (let i = tempQuestions.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[tempQuestions[i], tempQuestions[j]] = [tempQuestions[j], tempQuestions[i]];
		}
	}

	function showAnswer() {
		mode = 'Answer';
		showAnswerMode = true;
	}

	function handleYes() {
		if (tempQuestions.length > 0) {
			tempQuestions.splice(currentNum - 1, 1); // Remove the current question from temp array
			if (tempQuestions.length === 0) {
				alert('You have answered all questions!');
				return;
			}
			totalCorrectNum++;
			if (totalCorrectNum > originalTotalNum) {
				totalCorrectNum = originalTotalNum; // Reset totalCorrectNum to 1
			}
		}
		console.log('Questions remaining:', tempQuestions.length);
		console.log('tempQuestions:', tempQuestions); // Debugging: Log the tempQuestions array
		skipQuestion(true);
	}

	function handleNo() {
		// Move the current question to the end of the array
		if (tempQuestions.length > 1) {
			const currentQuestion = tempQuestions.splice(currentNum - 1, 1)[0];
			tempQuestions.push(currentQuestion);
		}
		skipQuestion(false);
	}

	function skipQuestion(skip = true) {
		mode = 'Question';
		showAnswerMode = false;
		if (skip) {
			currentNum++;
			if (currentNum > tempQuestions.length) {
				currentNum = 1; // loop back to the first question
			}
		} else {
			currentNum++;
			if (currentNum > tempQuestions.length) {
				currentNum = 1; // loop back to the first question
			}
		}
	}

	// Reactive statement to update current question, answer, open status, and question type
	$: {
		if (tempQuestions.length > 0) {
			const current = tempQuestions[currentNum - 1];
			currentQuestion = current.question;
			currentAnswer = current.answer;
			currentOpen = current.open;
			questionType = currentOpen ? 'Open-Ended Question' : 'Closed-Ended Question';

			console.log('Current Question:', currentQuestion); // Debugging: Log the current question
		}
	}
</script>

{#if gotData}
	<div class="flashcard-gridbox">
		<h2 id="flashcard-title" style="height: 50px;">{flashcardName}</h2>

		<div class="main-content">
			<div class="question-container" style="overflow-y: auto;">
				<div class="question-header">
					<h1 style="margin-bottom: 10px;">{mode}</h1>
					<h3 style="margin-bottom: 10px;">{questionType}</h3>
				</div>
				<div class="question">
					<p>{mode === 'Question' ? currentQuestion : currentAnswer}</p>
				</div>
			</div>
			<div class="flashcard-button-container">
				<FlashcardButton
					{totalCorrectNum}
					{originalTotalNum}
					{showAnswerMode}
					on:showanswer={showAnswer}
					on:yes={handleYes}
					on:no={handleNo}
					on:skipquestion={() => skipQuestion(true)}
				/>
			</div>
		</div>
	</div>
{/if}

<style>
	.flashcard-gridbox {
		/* Other styles remain unchanged */
		display: flex;
		flex-direction: column;
		min-height: 300px; /* Set a minimum height for the container */
	}

	#flashcard-title {
		/* Other styles remain unchanged */
		overflow: auto; /* Hide overflow text */
		text-overflow: ellipsis; /* Add ellipsis for text overflow */
		white-space: nowrap; /* Prevent text wrapping */
		max-width: 100%; /* Allow title to take full width */
		height: 50px; /* Set a fixed height for the title */
	}

	.main-content {
		/* Other styles remain unchanged */
		flex: 1; /* Allow main content to grow and fill remaining space */
		display: flex;
		flex-direction: column;
		justify-content: space-between; /* Space evenly between elements */
		padding: 20px;
		background-color: var(--dun);
		border-radius: 10px;
	}

	.question-container {
		/* Other styles remain unchanged */
		flex: 1; /* Allow question container to grow and fill remaining space */
		padding: 30px; /* Add padding to the container */
		overflow-y: auto; /* Add vertical scrollbar for overflow */
		/* display all the contents to be centered in the middle */
		display: flex;
		flex-direction: column;
		justify-content: center; /* Center content vertically */
		align-items: center;
	}

	.question-header {
		text-align: center; /* Center text horizontally */
	}
	.question-header h1 {
		margin-bottom: 5px !important; /* Add margin to separate elements */
	}
	.question-header h3 {
		margin-bottom: 40px !important; /* Add !important to increase specificity */
	}

	.question {
		height: 32vh; /* Set height to 50% of viewport height */
		display: flex;
		flex-direction: column;
		justify-content: center; /* Center content vertically */
	}

	.question p {
		text-align: center; /* Center text horizontally */
	}

	.flashcard-button-container {
		display: flex;
		justify-content: center;
		margin-top: 20px; /* Adjust as needed to create space between the question and button */
	}
</style>
