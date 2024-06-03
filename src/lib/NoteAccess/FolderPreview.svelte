<script>
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	export let link = '';
	export let title = '';

	let editOpen = false;

	const dispatch = createEventDispatcher();

	function requestOpenPopup(detail) {
		dispatch('openPopup', { detail, link, title });
	}

	function handleRedirect() {
		goto(`/app/folders/${link}`);
	}

	function handleOpenEdit() {
		// event.stopPropagation();
		console.log('open edit');
		editOpen = !editOpen;
	}

	function requestOpenPopupFolder(detail) {
		dispatch('openPopup', { detail, link, title });
	}

	function clickOutside(node) {
		// Event handler to check if click is outside the node
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
			}
		};
	}
</script>

<button class="folderButton" on:dblclick={handleRedirect}>
	<div class="textTrunc">
		<span class="material-symbols--folder icon"></span>
		<p class="text">{title}</p>
	</div>
	<div class="dropdown" use:clickOutside>
		<button on:click={handleOpenEdit} on:dblclick={(event) => event.stopPropagation()}>
			<span class="tabler--dots icon"></span>
		</button>
		{#if editOpen}
			<div class="dropdown-content">
				<button on:click={() => requestOpenPopup('titleFolder')}>Edit</button>
				<button on:click={() => requestOpenPopup('deleteFolder')}>Delete</button>
			</div>
		{/if}
	</div>
</button>

<style>
	.folderButton button {
		background: none;
		border: none;
		cursor: pointer;
	}
	.dropdown-content {
		right: 0;
		min-width: 100px;
	}
	.textTrunc {
		width: 80%;
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.text {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		flex-grow: 1; /* Take up remaining space */
	}
	.folderButton {
		position: relative;
		display: flex;
		height: 3rem;
		text-align: left;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		overflow: visible;
		padding: 0 1rem 0 1rem;
		color: var(--coyote);
		background: var(--dim_linen);
		border: none;
		border-radius: 5px;
	}
	.folderButton:hover {
		background: var(--almond);
	}
	p {
		font-size: 1rem;
		color: var(--text_high_contrast);
		font-weight: 600;
	}
</style>
