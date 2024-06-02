<script>
	import { authStore } from '$lib/store/store';
	import { rtdb, auth, firebaseConfig, db } from '$lib/firebase/firebase';
	import { onMount } from 'svelte';
	import firebase from 'firebase/compat/app';
	import 'firebase/compat/auth';
	import 'firebase/compat/database';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { updateFlashcardStore } from './store/flashcard';
	import Modal from '$lib/Flashcard/Modal.svelte';

	export let noteId = '';
	export let uid = '';
	export let username = '';

	let firepad;
	let isOpen = false;
	let flashcardName = '';
	let loading = false;

	onMount(async () => {
		try {
			await loadScript('https://www.gstatic.com/firebasejs/7.13.2/firebase-app.js');
			await loadScript('https://www.gstatic.com/firebasejs/7.13.2/firebase-auth.js');
			await loadScript('https://www.gstatic.com/firebasejs/7.13.2/firebase-database.js');
			await loadScript('/src/lib/firepad/codemirror.js');
			await loadScript('/src/lib/firepad/firepad.js');
			await loadScript('/src/lib/firepad/userlist.js');
			init();
		} catch (e) {
			console.log(e);
		}
	});

	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = src;
			script.onload = () => resolve(script);
			script.onerror = () => reject(new Error(`Script load error for ${src}`));
			document.head.appendChild(script);
		});
	}

	function init() {
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig);
		} else {
			firebase.app(); // if already initialized, use that one
		}

		var firepadRef = getExampleRef();

		var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });

		var userId = uid;

		firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
			richTextToolbar: true,
			richTextShortcuts: true,
			userId: userId
		});

		var firepadUserList = FirepadUserList.fromDiv(
			firepadRef.child('users'),
			document.getElementById('userlist'),
			userId,
			username
		);

		firepad.on('ready', function () {
			if (firepad.isHistoryEmpty()) {
				firepad.setText('Start writing!');
			}
		});
	}

	function getExampleRef() {
		var ref = firebase.database().ref();
		var hash = noteId;
		if (hash) {
			ref = ref.child(hash);
		} else {
			goto('/app/dashboard');
		}
		return ref;
	}

	function openModal() {
		isOpen = true;
	}

	function closeModal() {
		isOpen = false;
	}

	async function handleNewFlashcard(name) {
		closeModal();
		var text = firepad.getText();
		text = text.replace(/['"]+/g, '');
		console.log(text);

		loading = true; // Set loading state to true

		try {
			await updateFlashcardStore.addFlashcard(name, noteId, text);
			goto(`/app/flashcards`); // Navigate to the flashcards page after adding
		} catch (error) {
			console.error('Error generating flashcard:', error);
		} finally {
			loading = false; // Set loading state back to false
		}
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="/src/lib/firepad/codemirror.css" />
	<link rel="stylesheet" href="/src/lib/firepad/firepad.css" />
	<link rel="stylesheet" href="/src/lib/firepad/userlist.css" />
</svelte:head>

<Modal {isOpen} bind:flashcardName onSubmit={handleNewFlashcard} onCancel={closeModal} />

<div id="noteContainer">
	<div id="userlist"></div>
	<div id="firepad"></div>
	<button on:click={openModal}>Generate Flashcard</button>
</div>

{#if loading}
	<div class="loading-indicator">
		<!-- You can use any loading spinner or text -->
		<p>Loading...</p>
	</div>
{/if}

<style>
	.loading-indicator {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.75);
		color: white;
		padding: 1rem 2rem;
		border-radius: 8px;
		z-index: 1000; /* Ensure it's on top of other content */
	}
	
	#noteContainer {
		display: flex;
		flex-direction: column;
	}
	#userlist {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		height: auto;
		background-color: wheat;
	}
	#firepad {
		position: absolute;
		left: 175px;
		top: 0px;
		bottom: 0;
		right: 0;
	}
	button {
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
