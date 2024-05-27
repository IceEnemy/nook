<script>
	// import FolderPreview from "./FolderPreview.svelte";
	import FlashcardPreview from './FlashcardPreview.svelte';
	// import NotePreview from "./NotePreview.svelte";
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { onMount, onDestroy } from 'svelte';
	import { authStore, updateNoteStore } from '$lib/store/store.js';
	import { updateFlashcardStore } from '$lib/store/flashcard.js';
	import Authenticate from '$lib/Authenticate.svelte';
	import NoteNav from '$lib/noteNav.svelte';
	import { get } from 'svelte/store';
	import { fade, scale } from 'svelte/transition';

	export let ref = '';
	let dataGot = false;
	let initialData = true;

	let dropdownOpen = { new: false, filter: false, sort: false };

	let editDetail = '';
	let newPopup = '';
	let flashcardName = '';
	let parentNoteId = '';

	const filterOptions = ['Last Edit', 'Created', 'A-Z'];
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
		console.log('hey!!');
		const { detail, link, title } = event.detail;
		newPopup = detail;
		editDetail = link;
		flashcardName = title;
	}

	$: filteredFlashcards = searched
		? flashcards.filter((flashcards) =>
				flashcards.title.toLowerCase().includes(searched.toLowerCase())
			)
		: flashcards;

	$: filterSelection,
		sortSelection,
		(filteredFlashcards = filteredFlashcards.sort(sortingFunction));

	function sortingFunction(a, b) {
		let compare = 0; // Default to 'equal'
		switch (filterSelection) {
			case 'A-Z':
				compare = a.title.localeCompare(b.title);
				break;
			case 'Last Edit':
				compare = new Date(b.lastEdited) - new Date(a.lastEdited);
				break;
			case 'Created':
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
			flashcards.push({ ...flashcardDoc.data(), flashcardId: file.flashcardId });
			console.log(flashcards);
		}
		flashcards.sort(sortingFunction);
	}

	async function getFlashcardData() {
		dataGot = false;

		if (unsubscribe) unsubscribe();

		const docRef = ref ? doc(db, 'flashcards', ref) : doc(db, 'users', auth.currentUser.uid);

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
					dataGot = false; // Consider setting to false or handling error state
				});
		});
	}
	onDestroy(() => {
		if (unsubscribe) return unsubscribe();
	});

	function clickOutside(node, name) {
		// Event handler to check if click is outside the node
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
			}
		};
	}

	function handleNewPopup(type) {
		dropdownOpen.new = false;
		newPopup = type;
	}

	async function handleAddFlashcard(title, NoteId) {
		try {
			await updateFlashcardStore.addFlashcard(title, NoteId);
		} catch (e) {
			console.log(e);
		}
		newPopup = '';
		flashcardName = '';
		parentNoteId = '';
	}
</script>

{#if dataGot}
	<div class="pageContainer">
		<form class="manageButtons">
			<div class="choiceButtons">
				<div class="new-Button" use:clickOutside={'new'}>
					<button class="addButton" on:click={() => handleNewPopup('flashcard')}>
						<span class="ph--plus-bold icon"></span>
						<p class="text">Generate Flashcards</p>
					</button>
				</div>
				<div class="dropdown" use:clickOutside={'filter'}>
					<button class="addButton varAddButton" on:click={() => toggleDropdown('filter')}>
						<p class="text">{filterSelection}</p>
						<span class="bxs--down-arrow small-icon"></span>
					</button>
					{#if dropdownOpen.filter}
						<!-- Conditional rendering for dropdown content -->
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
							<!-- Add more options as needed -->
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
							<!-- Add more options as needed -->
						</div>
					{/if}
				</div>
			</div>
			<label>
				<span class="ic--round-search icon"></span>
				<input type="text" class="searchbar" placeholder="Seach Flashcards" bind:value={searched} />
			</label>
		</form>

		<div class="flashcardContainer">
			<p>flashcards</p>

			<div class="flashcardGrid">
				{#each filteredFlashcards as flash}
					<FlashcardPreview
						title={flash.title}
						link={flash.flashcardId}
						on:openPopup={listenEditDetail}
					/>
					<!-- {/if} -->
				{/each}
			</div>
		</div>
		{#if newPopup !== ''}
			<div class="changePopups" transition:fade={{ duration: 200 }}>
				<div
					class="changeInput"
					transition:scale={{ start: 0.8, end: 1, duration: 200 }}
					use:clickOutside={'popup'}
				>
					{#if newPopup === 'flashcard!'}
						<h2>New flashcard name</h2>
						<form class="popupForm">
							<div>
								<label class="accInputs">
									<input type="text" placeholder="Flashcard title" bind:value={flashcardName} />
									<input type="text" placeholder="Note ID" bind:value={parentNoteId} />
								</label>
							</div>
							<label class="saveButton">
								<button on:click={() => handleAddFlashcard(flashcardName, parentNoteId)}
									>Confirm</button
								>
							</label>
						</form>
					{:else if newPopup === 'titleFlashcard'}
						<h2>Edit title</h2>
						<form class="popupForm">
							<div>
								<label class="accInputs">
									<input type="text" placeholder="New title" bind:value={flashcardName} />
								</label>
							</div>

							<label class="saveButton">
								<button
									on:click={() =>
										updateFlashcardStore.updateTitleFlashcard(editDetail, flashcardName)}
									>Confirm</button
								>
							</label>
						</form>
					{:else if newPopup === 'deleteFlashcard'}
						<h2>Are you sure you want to delete this flashcard?</h2>
						<form class="popupForm">
							<label class="saveButton">
								<button
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
	.flashcardGrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
		padding-right: 0.5rem;
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
		/* width: 120px; */
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
</style>
