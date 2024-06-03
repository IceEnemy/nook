<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		isPlaying,
		currentTrack,
		audioProgress,
		audioDuration,
		isLooping,
		isRandom,
		playTrack,
		playPause,
		nextTrack,
		prevTrack,
		toggleLoop,
		toggleRandom,
		formatTime,
		songArr,
		initializeAudioElements
	} from '$lib/store/music.js';

	let unsubscribe;

	onMount(() => {
		// Ensure audio elements are initialized
		initializeAudioElements();

		// Subscribe to currentTrack to update progress when the track changes
		unsubscribe = currentTrack.subscribe(() => {
			if (typeof window !== 'undefined') {
				initializeAudioElements();
			}
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<main>
	<div class="container">
		<div class="header">
			<h1>Music Player</h1>
		</div>

		<div class="music">
			<div class="thumbnails">
				{#if $currentTrack !== null}
					<img src={songArr[$currentTrack].thumbnail} alt="" class="thumbnailImg">
					<h2>{songArr[$currentTrack].name}</h2>
				{/if}
				<!-- <img src="{songArr[]}" alt="" class="thumbnailImg"> -->
			</div>
			<div class="musicChoice">
				<div class="choiceHead">
					<p>#</p>
					<p>Name</p>
					<p>Author</p>
					<p>Duration</p>
				</div>
				{#each songArr as song, i}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="song" on:click={() => playTrack(i)}>
						<p>{i + 1}</p>
						<p>{song.name}</p>
						<p>{song.author}</p>
						<p>{song.duration}</p>
					</div>
				{/each}
			</div>
		</div>

		<div class="footer">
			<!-- {#if $currentTrack !== null} -->
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
			<!-- {/if} -->
		</div>
	</div>
</main>

<style>
	.thumbnailImg{
		width: 250px;
		height: 250px;
		object-fit: cover;
		border-radius: 5px;
		
	}

	button {
		background: transparent;
		color: var(--default_white);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.circularButton {
		background-color: var(--default_white);
		color: var(--darker_van_dyke); /* Ensure the icon color contrasts with the button background */
		border-radius: 50%;
		width: 34px; /* Adjust size as needed */
		height: 34px; /* Adjust size as needed */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.is-active {
		color: var(--yellow_green);
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

	.choiceHead,
	.song {
		display: grid;
		grid-template-columns: 50px 1fr 1fr 80px;
		gap: 10px;
		padding: 10px;
		align-items: center;
		border-bottom: 2px solid var(--darker_van_dyke);
	}

	.song {
		border-bottom: 1px solid var(--dim_linen);
		cursor: pointer;
	}

	.thumbnails,
	.musicChoice {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.thumbnails {
		width: 30%;
		background-color: var(--default_white);
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.musicChoice {
		width: 70%;
		background-color: var(--seasalt);
		padding: 3rem;
	}

	.music {
		display: flex;
		flex-direction: row;
		flex: 1;
	}

	.header,
	.footer {
		color: var(--default_white);
		display: flex;
		align-items: center;
		height: 90px;
		padding-left: 40px;
		background-color: var(--darker_van_dyke);
	}

	.footer {
		justify-content: center;
		flex-direction: column;
		margin-top: auto;
		padding-left: 0;
	}

	.container {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	progress {
		width: 70%;
		height: 10px;
		border-radius: 5px;
		-webkit-appearance: none;
		appearance: none;
	}

	progress::-webkit-progress-bar {
		background-color: var(--chamoisee);
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
