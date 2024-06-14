<script>
	import { onMount, onDestroy } from 'svelte';
	import { authHandlers, showModal } from '$lib/store/store';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/store/store.js';
	import OptionButton from './assets/OptionButton.svelte';
	import NookLogo from './assets/NookLogo.svelte';
	import FolderItem from '$lib/NoteAccess/FolderItem.svelte';
	import NoteItem from '$lib/NoteAccess/NoteItem.svelte';
	import {
		timerState,
		globalWorkTime,
		globalBreakTime,
		timer,
		isRunning,
		startTimer,
		stopTimer,
		resetTimer
	} from '$lib/store/timer.js';
	import {
		isPlaying,
		currentTrack,
		audioProgress,
		audioDuration,
		isLooping,
		isRandom,
		playPause,
		nextTrack,
		prevTrack,
		toggleLoop,
		toggleRandom,
		formatTime,
		songArr
	} from '$lib/store/music.js';

	$: username = $authStore.data?.username || 'Loading..';
	$: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';

	let unsubscribe;

	const navOption1 = [
		{ name: 'Dashboard', icon: 'material-symbols-light--dashboard-outline' },
		// { name: 'Notifications', icon: 'material-symbols--inbox' },
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

	let isToolsBarOpen = false;
	let isCallBarOpen = false;

	function toggleToolsBar() {
		isToolsBarOpen = !isToolsBarOpen;
	}
	function toggleCallBar() {
		isCallBarOpen = !isCallBarOpen;
	}

	$: trackName = $currentTrack !== null ? songArr[$currentTrack].name : 'No Track Playing';
	$: timerMessage = $isRunning
		? $timerState === 'working'
			? 'Time to work!'
			: 'Time to take a break!'
		: 'Timer not started!';
	$: timerProgress = $isRunning
		? $timerState === 'working'
			? $timer / $globalWorkTime
			: $timer / $globalBreakTime
		: 0;

	let folders = [];
	let noteArray = [];

	onMount(async () => {
		await handleRecentNotes(5);
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	async function handleRecentNotes(maxRecentNotes) {
		let user = auth.currentUser;
		if (!user) {
			console.log('No user is signed in.');
			return;
		}

		let userDocRef = doc(db, 'users', user.uid);

		unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
			if (!docSnapshot.exists()) {
				console.log('User document not found.');
				folders = [];
				return;
			}

			let userData = docSnapshot.data();
			if (!userData.notes || userData.notes.length === 0) {
				console.log('No notes found.');
				folders = [];
				return;
			}

			await fillArrays(userData.notes, maxRecentNotes);
		});
	}

	async function fillArrays(notes, maxRecentNotes) {
		try {
			let folderMap = new Map();
			let counter = 0; // Counter for limiting the number of recent notes

			for (const note of notes) {
				// console.log('Note:', note);
				if (counter >= maxRecentNotes) {
					break; // Exit the loop if maxRecentNotes limit is reached
				}
				if (note.type === 'note') {
					const noteDocRef = doc(db, 'notes', note.noteId);
					const noteDoc = await getDoc(noteDocRef);
					if (noteDoc.exists()) {
						const noteData = noteDoc.data();
						let folderName = 'Entries';
						if (!folderMap.has(folderName)) {
							folderMap.set(folderName, []);
						}
						folderMap.get(folderName).push({ ...noteData, noteId: note.noteId });
					}
				} else if (note.type === 'folder') {
					const folderDocRef = doc(db, 'folders', note.noteId);
					const folderDoc = await getDoc(folderDocRef);
					if (folderDoc.exists()) {
						const folderData = folderDoc.data();
						const folderNotes = [];

						for (const folderNote of folderData.notes) {
							const noteDocRef = doc(db, 'notes', folderNote.noteId);
							const noteDoc = await getDoc(noteDocRef);
							if (noteDoc.exists()) {
								const noteData = noteDoc.data();
								folderNotes.push({ ...noteData, noteId: folderNote.noteId });
							}
						}
						folderMap.set(folderData.title, folderNotes);
					}
				}
				counter++; // Increment the counter for each processed note or folder
			}

			// Sort notes within each folder by last edited date
			for (const [folderName, notes] of folderMap) {
				notes.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
			}

			// Sort folders by the most recent last edited date of their notes
			const sortedFolders = Array.from(folderMap.entries())
				.sort(([, notesA], [, notesB]) => {
					const lastEditedA = notesA.length ? new Date(notesA[0].lastEdited) : new Date(0);
					const lastEditedB = notesB.length ? new Date(notesB[0].lastEdited) : new Date(0);
					return lastEditedB - lastEditedA;
				})
				.map(([name, notes]) => ({ name, notes }));

			folders = sortedFolders;
			console.log('Data loaded and arrays filled');
		} catch (error) {
			console.error('Error filling arrays:', error);
			folders = [];
		}
	}
</script>

<nav class="navbar">
	<div class="logo">
		<NookLogo />
	</div>

	<ul class="navSection">
		<h2 class="sectionTitle">Overview</h2>
		{#each navOption1 as option}
			<button on:click={() => navigateTo(option.name)}>
				<span class={option.icon}></span>
				{option.name}
			</button>
		{/each}
	</ul>
	<ul class="navSection">
		<h2 class="sectionTitle">Productivity Tools</h2>
		{#each navOption2 as option}
			<button on:click={() => navigateTo(option.name)}>
				<span class={option.icon}></span>
				{option.name}
			</button>
		{/each}
	</ul>
	<ul class="navSection">
		<h2 class="sectionTitle">Quick Access</h2>
		{#each folders as folder}
			<FolderItem {folder} />
		{/each}
		<div></div>
		{#each noteArray as note}
			<NoteItem {note} />
		{/each}
	</ul>
	<div class="accountNav">
		<div class="accountCred">
			<img class="imgContainer" src={profilePic} alt="" />
			<p>{username}</p>
		</div>
		<OptionButton />
	</div>
</nav>

<div class="toolsBar {isToolsBarOpen ? '' : 'closed'}">
	<button on:click={toggleToolsBar} class="toggleButton">
		{#if isToolsBarOpen}
			<span class="iconamoon--arrow-right-2-duotone icon"></span>
		{:else}
			<span class="iconamoon--arrow-left-2-duotone icon"></span>
		{/if}
	</button>
	<div class="content">
		<h2>Music</h2>
		<p>Playing: {trackName}</p>
		<div class="progressContainer">
			<button on:click={toggleRandom} class:is-active={$isRandom}>
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
			<button on:click={toggleLoop} class:is-active={$isLooping}>
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
		right: 0;
		top: 0;
		transform: translateY(-50%);
		z-index: 100;
		background-color: var(--default_white);
		transition: transform 0.3s ease;
		transform: translateX(0);
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;

		border-radius: 0 0 0 32px;
	}

	.toolsBar h2 {
		color: var(--darker_van_dyke);
	}

	.toolsBar.closed {
		transform: translateX(100%);
	}

	.toggleButton {
		position: absolute;
		top: 50%;
		right: 100%;
		transform: translateY(-50%);
		background-color: var(--navbar_bg_darker);
		color: var(--default_white);
		border: none;
		padding: 0.5rem;
		cursor: pointer;

		border-radius: 16px 0 0 16px;
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

	.progressContainer button:not(.circularButton) {
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
