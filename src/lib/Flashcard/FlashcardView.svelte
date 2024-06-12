<script>
	import FlashcardPreview from './FlashcardPreview.svelte';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { onMount, onDestroy } from 'svelte';
	import { updateFlashcardStore } from '$lib/store/flashcard.js';
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let ref = '';
	let dataGot = false;
	let initialData = true;

	let dropdownOpen = { new: false, filter: false, sort: false };
	let editDetail = '';
	let newPopup = '';
	let flashcardName = '';
	let current = '';

	const filterOptions = ['Last edited', 'Recently created', 'Sort A-Z'];
	let filterSelection = filterOptions[0];
	const sortOptions = ['Ascending', 'Descending'];
	let sortSelection = sortOptions[0];

	function toggleDropdown(name) {
		dropdownOpen[name] = !dropdownOpen[name];
	}

	onMount(async () => {
		await getFlashcardData();
		initialData = false;
	});

	let docSnap = '';
	let searched = '';
	let flashcards = [];
	let unsubscribe;

	function listenEditDetail(event) {
		const { detail, link, title } = event.detail;
		newPopup = detail;
		editDetail = link;
		flashcardName = title;
	}

	$: filteredFlashcards = searched
		? flashcards.filter((flashcard) =>
				flashcard.title.toLowerCase().includes(searched.toLowerCase())
			)
		: flashcards;

	$: filterSelection,
		sortSelection,
		(filteredFlashcards = filteredFlashcards.sort(sortingFunction));

	function sortingFunction(a, b) {
		let compare = 0;
		switch (filterSelection) {
			case 'Sort A-Z':
				compare = a.title.localeCompare(b.title);
				break;
			case 'Last edited':
				compare = new Date(b.lastEdited) - new Date(a.lastEdited);
				break;
			case 'Recently created':
				compare = new Date(b.created) - new Date(a.created);
				break;
			default:
				break;
		}
		return sortSelection === 'Ascending' ? compare : -compare;
	}

	$: if (!initialData && ref) getFlashcardData();

	async function fillArrays() {
		flashcards = [];
		const files = docSnap.data().flashcards;
		for (const file of files) {
			const flashcardDoc = await getDoc(doc(db, 'flashcards', file.flashcardId));
			const flashcardData = flashcardDoc.data();
			const parentNoteName = await getNoteName(flashcardData.parentNoteId);
			flashcards.push({ ...flashcardData, flashcardId: file.flashcardId, parentNoteName });
		}
		flashcards.sort(sortingFunction);
	}

	function handleRedirect() {
		goto(`/app/flashcards/${link}`);
	}

	async function getFlashcardData() {
		dataGot = false;

		if (unsubscribe) unsubscribe();

		let docRef;
		if (ref && ref.trim() !== '') {
			docRef = doc(db, 'flashcards', ref);
		} else if (auth.currentUser && auth.currentUser.uid) {
			docRef = doc(db, 'users', auth.currentUser.uid);
		} else {
			console.error('Invalid document reference. Please provide a valid document reference.');
			return;
		}

		unsubscribe = onSnapshot(docRef, (doc) => {
			dataGot = false;
			docSnap = doc;

			fillArrays()
				.then(() => {
					dataGot = true;
					console.log('Data loaded and arrays filled');
				})
				.catch((error) => {
					console.error('Error filling arrays:', error);
					dataGot = false;
				});
		});
	}

	onDestroy(() => {
		if (unsubscribe) return unsubscribe();
	});

	function clickOutside(node, name) {
		const handleClick = (event) => {
			if (name == 'popup') {
				if (node && !node.contains(event.target) && !event.defaultPrevented) {
					newPopup = '';
					flashcardName = '';
				}
			} else {
				if (node && !node.contains(event.target) && !event.defaultPrevented) {
					dropdownOpen[name] = false;
				}
			}
		};

		const handleEscape = (event) => {
			if (event.key === 'Escape' || event.keyCode === 27) {
				if (name == 'popup') {
					newPopup = '';
					flashcardName = '';
				} else {
					dropdownOpen[name] = false;
				}
			}
		};

		document.addEventListener('click', handleClick, true);
		document.addEventListener('keydown', handleEscape, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
				document.removeEventListener('keydown', handleEscape, true);
			}
		};
	}

	function formatDate(timestamp) {
		let date = new Date(timestamp);
		let day = date.getDate();
		let month = date.toLocaleString('default', { month: 'long' });
		let year = date.getFullYear();

		return `${month} ${day}, ${year}`;
	}

	async function getNoteName(noteId) {
		let noteName = '';
		let noteRef = doc(db, 'notes', noteId);

		try {
			const docSnapshot = await getDoc(noteRef);
			if (docSnapshot.exists()) {
				noteName = docSnapshot.data().title;
			}
		} catch (error) {
			console.error('Error getting note name:', error);
		}

		return noteName;
	}
</script>

{#if dataGot}
	<div class="pageContainer">
		<form class="manageButtons">
			<div class="choiceButtons">
				<div class="dropdown" use:clickOutside={'filter'}>
					<button class="addButton varAddButton" on:click={() => toggleDropdown('filter')}>
						<p class="text">{filterSelection}</p>
						<span class="bxs--down-arrow small-icon"></span>
					</button>
					{#if dropdownOpen.filter}
						<div class="dropdown-content">
							{#each filterOptions as option}
								{#if option !== filterSelection}
									<button
										on:click={() => {
											filterSelection = option;
											toggleDropdown('filter');
										}}
									>
										<p class="text">{option}</p>
									</button>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
				<div class="dropdown" use:clickOutside={'sort'}>
					<button class="addButton varAddButton" on:click={() => toggleDropdown('sort')}>
						<p class="text">{sortSelection}</p>
						<span class="bxs--down-arrow small-icon"></span>
					</button>
					{#if dropdownOpen.sort}
						<div class="dropdown-content">
							{#each sortOptions as option}
								{#if option !== sortSelection}
									<button
										on:click={() => {
											sortSelection = option;
											toggleDropdown('sort');
										}}
									>
										<p class="text">{option}</p>
									</button>
								{/if}
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<label class="searchButton">
				<span class="ic--round-search icon"></span>
				<input
					type="text"
					class="searchbar"
					placeholder="Search Flashcards"
					bind:value={searched}
				/>
			</label>
		</form>

		<div class="flashcardContainer">
			<div class="flashcardHeader">
				<p>Title</p>
				<p>Source</p>
				<p>Date Created</p>
				<!-- <p class="vertical--dots icon"></p> -->
			</div>
			{#each filteredFlashcards as flash}
				<div class="flashcard">
					<FlashcardPreview
						title={flash.title}
						link={flash.flashcardId}
						parent={flash.parentNoteName}
						parentId={flash.parentNoteId}
						date={formatDate(flash.created)}
						on:openPopup={listenEditDetail}
						on:click={(event) => event.stopPropagation()}
					/>
				</div>
			{/each}
		</div>
		{#if newPopup !== ''}
			<div class="changePopups" transition:fade={{ duration: 200 }}>
				<div
					class="changeInput"
					transition:scale={{ start: 0.8, end: 1, duration: 200 }}
					use:clickOutside={'popup'}
				>
					{#if newPopup === 'titleFlashcard'}
						<h2>Edit title</h2>
						<form class="popupForm">
							<div>
								<label class="accInputs">
									<input type="text" placeholder="New title" bind:value={flashcardName} />
								</label>
							</div>
							<label class="saveButton">
								<button
									on:click={() => {
										updateFlashcardStore.updateTitleFlashcard(editDetail, flashcardName);
										newPopup = '';
										flashcardName = '';
										location.reload();
									}}>Confirm</button
								>
							</label>
						</form>
					{:else if newPopup === 'deleteFlashcard'}
						<h2>Are you sure you want to delete this flashcard?</h2>
						<form class="popupForm">
							<label class="saveButton">
								<button
									type="button"
									on:click={() => {
										updateFlashcardStore.deleteFlashcard(editDetail);
										newPopup = '';
										flashcardName = '';
									}}>Confirm</button
								>
							</label>
						</form>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.ic--round-search {
		top: 50px;
		margin-left: 10px;
	}
	form label {
		border-radius: 100px;
	}
	.manageButtons {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	.choiceButtons {
		display: flex;
		gap: 10px;
	}
	.pageContainer {
		height: 80%;
		overflow-y: scroll;
	}
	.flashcardContainer {
		width: 100%;
		margin-bottom: 1rem;
	}
	.flashcardHeader {
		display: grid;
		grid-template-columns: 32vw 1fr 0.4fr 50px;
		gap: 10px;
		padding: 10px;
		align-items: center;
		border-bottom: 2px solid var(--darker_van_dyke);
	}
	.flashcardHeader p {
		color: var(--van_dyke);
	}
	.text {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex-grow: 1;
	}
	.addButton {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--dim_linen);
		border: solid 1px var(--almond);
		color: var(--text_high_contrast);
		gap: 5px;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		height: 3rem;
	}
	.varAddButton {
		width: 150px;
	}
	.addButton:hover {
		background: var(--almond);
	}
	p {
		font-size: 1rem;
		color: var(--text_high_contrast);
		font-weight: 600;
	}
	.searchButton {
		margin-right: 0.5rem;
	}
</style>
