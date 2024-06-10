<script>
	import FolderPreview from './FolderPreview.svelte';
	import NotePreview from './NotePreview.svelte';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { onMount, onDestroy } from 'svelte';
	import { authStore, updateNoteStore } from '$lib/store/store.js';
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
	let noteName = '';

	const filterOptions = ['Last Edit', 'Created', 'A-Z'];
	let filterSelection = filterOptions[0];
	const sortOptions = ['Ascending', 'Descending'];
	let sortSelection = sortOptions[0];

	function toggleDropdown(name) {
		dropdownOpen[name] = !dropdownOpen[name];
	}

	onMount(async () => {
		await getNoteData();
		initialData = false;
	});

	let docSnap = '';
	let searched = '';
	let folders = [];
	let notes = [];
	let unsubscribe;

	function listenEditDetail(event) {
		console.log('hey!!');
		const { detail, link, title } = event.detail;
		newPopup = detail;
		editDetail = link;
		noteName = title;
	}

	$: filteredFolders = searched
		? folders.filter((folder) => folder.title.toLowerCase().includes(searched.toLowerCase()))
		: folders;

	$: filteredNotes = searched
		? notes.filter((note) => note.title.toLowerCase().includes(searched.toLowerCase()))
		: notes;

	$: filterSelection, sortSelection, (filteredFolders = filteredFolders.sort(sortingFunction));
	$: filterSelection, sortSelection, (filteredNotes = filteredNotes.sort(sortingFunction));

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

	$: if (!initialData && ref) getNoteData();

	async function fillArrays() {
		folders = [];
		notes = [];
		const files = docSnap.data().notes;
		for (const file of files) {
			if (file.type === 'folder') {
				const folderDoc = await getDoc(doc(db, 'folders', file.noteId));
				folders.push({ ...folderDoc.data(), noteId: file.noteId });
				console.log(folders);
			} else {
				const noteDoc = await getDoc(doc(db, 'notes', file.noteId));
				notes.push({ ...noteDoc.data(), noteId: file.noteId });
				console.log(notes);
			}
		}
		folders.sort(sortingFunction);
		notes.sort(sortingFunction);
	}

	async function getNoteData() {
		dataGot = false;

		if (unsubscribe) unsubscribe();

		const docRef = ref ? doc(db, 'folders', ref) : doc(db, 'users', auth.currentUser.uid);

		unsubscribe = onSnapshot(docRef, (doc) => {
			dataGot = false;
			docSnap = doc;
			// Wait for fillArrays to complete before setting dataGot to true
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
					noteName = '';
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
					noteName = '';
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

	async function handleAddNote(title, type) {
		try {
			await updateNoteStore.addNote(title, type, ref);
		} catch (e) {
			console.log(e);
		}
		newPopup = '';
		noteName = '';
	}

	console.log(folders);
	console.log(notes);
</script>

{#if dataGot}
	<div class="pageContainer">
		<form class="manageButtons">
			<div class="choiceButtons">
				<div class="dropdown" use:clickOutside={'new'}>
					<button class="addButton" on:click={() => toggleDropdown('new')}>
						<span class="ph--plus-bold icon"></span>
						<p class="text">New</p>
					</button>
					{#if dropdownOpen.new}
						<!-- Conditional rendering for dropdown content -->
						<div class="dropdown-content">
							<button on:click={() => handleNewPopup('folder')}>
								<span class="humbleicons--folder-add icon"></span>
								New Folder
							</button>
							<button on:click={() => handleNewPopup('note')}>
								<span class="iconamoon--file-add-bold icon"></span>
								New Note
							</button>
							<!-- Add more options as needed -->
						</div>
					{/if}
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
			<label class="searchButton">
				<span class="ic--round-search icon"></span>
				<input type="text" class="searchbar" placeholder="Search files" bind:value={searched} />
			</label>
		</form>

		<div class="folderContainer">
			<p id="folderSection">Folders</p>
			<div class="folderGrid">
				{#each filteredFolders as folder}
					<!-- {#if (searched != '' && folder.title.toLowerCase().includes(searched.toLowerCase())) || searched === ''} -->
					<FolderPreview
						title={folder.title}
						link={folder.noteId}
						on:openPopup={listenEditDetail}
					/>
					<!-- {/if} -->
				{/each}
			</div>
		</div>
		<div class="noteContainer">
			<p id="noteSection">Notes</p>
			<div class="noteGrid">
				{#each filteredNotes as note}
					<NotePreview title={note.title} link={note.noteId} on:openPopup={listenEditDetail} />
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
					{#if newPopup === 'folder'}
						<h2>New folder name</h2>
						<form class="popupForm">
							<div>
								<label class="accInputs">
									<input type="text" placeholder="Folder title" bind:value={noteName} />
								</label>
							</div>
							<label class="saveButton">
								<button on:click={() => handleAddNote(noteName, 'folder')}>Confirm</button>
							</label>
						</form>
					{:else if newPopup === 'note'}
						<h2>New note name</h2>
						<form class="popupForm">
							<div>
								<label class="accInputs">
									<input type="text" placeholder="Note title" bind:value={noteName} />
								</label>
							</div>

							<label class="saveButton">
								<button on:click={() => handleAddNote(noteName, 'note')}>Confirm</button>
							</label>
						</form>
					{:else if newPopup === 'titleNote' || newPopup === 'titleFolder'}
						<h2>Edit title</h2>
						<form class="popupForm">
							<div>
								<label class="accInputs">
									<input type="text" placeholder="New title" bind:value={noteName} />
								</label>
							</div>

							<label class="saveButton">
								<button
									on:click={() => {
										updateNoteStore.updateTitle(
											editDetail,
											newPopup === 'titleNote' ? 'note' : 'folder',
											noteName
										);
										newPopup = '';
										noteName = '';
										location.reload();
									}}>Confirm</button
								>
							</label>
						</form>
					{:else if newPopup === 'deleteNote' || newPopup === 'deleteFolder'}
						<h2>Are you sure you want to delete this note?</h2>
						<form class="popupForm">
							<label class="saveButton">
								<button
									on:click={() => {
										updateNoteStore.deleteNote(
											editDetail,
											newPopup == 'deleteNote' ? 'note' : 'folder',
											ref
										);
										newPopup = '';
										noteName = '';
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
	.folderContainer {
		width: 100%;
		margin-bottom: 1rem;
	}
	.folderGrid,
	.noteGrid {
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
	#folderSection,
	#noteSection {
		margin-bottom: 10px;
	}
	.searchButton {
		margin-right: 0.5rem;
	}
</style>
