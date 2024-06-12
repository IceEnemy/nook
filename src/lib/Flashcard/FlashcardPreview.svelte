<script>
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';

	export let link = '';
	export let title = '';
	export let date = '';
	export let parent = '';
	export let parentId = '';

	let editOpen = false;

	const dispatch = createEventDispatcher();

	function requestOpenPopup(detail) {
		dispatch('openPopup', { detail, link, title });
	}

	function handleRedirect(type) {
		if (type === 'flashcard') goto(`/app/flashcards/${link}`);
		else if (type === 'note') goto(`/app/notes/${parentId}`);
	}

	function handleOpenEdit() {
		console.log('open edit');
		editOpen = !editOpen;
		console.log(link);
	}

	function clickOutside(node) {
		const handleClick = (event) => {
			if (node && !node.contains(event.target) && !event.defaultPrevented) {
				editOpen = false;
			}
		};

		const handleEscape = (event) => {
			if (event.key === 'Escape' || event.keyCode === 27) {
				editOpen = false;
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
</script>

<button class="flashcardButton">
	<p id="flashcard" on:dblclick={() => handleRedirect('flashcard')}>{title}</p>
	<p id="note" on:dblclick={() => handleRedirect('note')}>{parent}</p>
	<p>{date}</p>
	<div class="dropdown" use:clickOutside>
		<button on:click={handleOpenEdit} on:dblclick={(event) => event.stopPropagation()}>
			<span class="vertical--dots icon"></span>
		</button>
		{#if editOpen}
			<div class="dropdown-content">
				<button on:click={() => requestOpenPopup('titleFlashcard')}>Edit</button>
				<button on:click={() => requestOpenPopup('deleteFlashcard')}>Delete</button>
			</div>
		{/if}
	</div>
</button>

<style>
	.flashcardButton p {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex-grow: 1; 
	}

	.flashcardButton {
		display: grid;
		grid-template-columns: 32vw 1fr 0.4fr 50px;
		gap: 10px;
		padding: 10px;
		align-items: center;
		text-align: left;
		border-bottom: 2px solid var(--darker_van_dyke);
		width: 100%;
	}
	button {
		background: none;
		border: none;
		cursor: pointer;
	}
	.dropdown-content {
		right: 0;
		min-width: 100px;
	}
	p {
		color: var(--coyote);
	}
</style>
