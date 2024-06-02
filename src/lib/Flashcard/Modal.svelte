<!-- Modal.svelte -->
<script>
	export let isOpen = false;
	export let flashcardName = '';
	export let onSubmit = () => {};
	export let onCancel = () => {};

	function handleSubmit() {
		onSubmit(flashcardName);
	}
</script>

{#if isOpen}
	<div class="modal-overlay">
		<div class="modal">
			<h2>Name your flashcard</h2>
			<input type="text" bind:value={flashcardName} placeholder="Enter flashcard name" />
			<button on:click={handleSubmit}>Submit</button>
			<button on:click={onCancel}>Cancel</button>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000; /* High z-index to ensure it is on top */
	}

	.modal {
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		z-index: 1001; /* Higher z-index for the modal content */
	}

	input {
		margin-bottom: 10px;
		padding: 8px;
		width: 100%;
		box-sizing: border-box;
	}

	button {
		margin: 5px;
		padding: 8px 12px;
	}
</style>
