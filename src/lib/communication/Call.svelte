<script>
	import { onMount } from 'svelte';
	import Peer from 'peerjs';
	import { onAuthStateChanged } from 'firebase/auth';
	import { auth } from '$lib/firebase/firebase';
	import { writable } from 'svelte/store';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/firebase.js';

	export let targetId;

	$: codeId = targetId;

	let peer;
	let userId = auth.currentUser.uid;
	let youId = '';
	let incomingCall = null;
	let isReceivingCall = false;
	let isCallActive = false; // Track if a call is currently active
	let dataGot = false;
	let username = '';

	// State variables for video and audio control
	let isVideoEnabled = true;
	let isAudioEnabled = true;
	let videocurrent;
	let videoEl;

	onMount(async () => {
		peer = await new Peer(userId);

		peer.on('open', (id) => {
			youId = id;
			console.log('Your peer ID:', id);
			dataGot = true;
		});
		username = await getUsername(userId);

		peer.on('error', (err) => {
			console.error(err);
		});

		peer.on('connection', (conn) => {
			conn.on('data', (data) => {
				console.log('Received data:', data);
			});
			conn.on('open', () => {
				conn.send('hello');
			});
		});

		peer.on('call', (call) => {
			incomingCall = call;
			isReceivingCall = true;
			isCallActive = true; // Set call active when receiving call
		});
	});

	const renderYouWebcam = (stream) => {
		videoEl.srcObject = stream;
		videoEl.play();
	};

	async function getUsername(uid) {
		const userRef = doc(db, 'users', targetId);
		const userSnap = await getDoc(userRef);
		return userSnap.data().username;
	}
	const handleCall = async () => {
		if (!codeId) {
			console.error('Please enter a peer ID to call.');
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			const call = peer.call(codeId, stream);
			videocurrent.srcObject = stream;
			videocurrent.play();
			call.on('stream', renderYouWebcam);
			call.on('close', () => {
				videocurrent.srcObject = null;
				isCallActive = false; // Reset call active status
			});
			isCallActive = true; // Set call active when initiating call
		} catch (err) {
			console.error('Failed to make a call', err);
		}
	};

	const acceptCall = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			incomingCall.answer(stream);
			incomingCall.on('stream', renderYouWebcam);
			videocurrent.srcObject = stream;
			videocurrent.play();
			isReceivingCall = false;
			isCallActive = true; // Set call active when accepting call
		} catch (err) {
			console.error('Failed to accept the call', err);
		}
	};

	const declineCall = () => {
		incomingCall = null;
		isReceivingCall = false;
		isCallActive = false; // Reset call active status
	};

	const endCall = () => {
		if (incomingCall) {
			// incomingCall.close();
			isReceivingCall = false;
			isCallActive = false; // Reset call active status
		}
		location.reload(); // Reload the page to reset the connection
	};

	// Toggle video stream
	const toggleVideo = () => {
		isVideoEnabled = !isVideoEnabled;
		const tracks = videocurrent.srcObject.getVideoTracks();
		tracks.forEach((track) => {
			track.enabled = isVideoEnabled;
		});
	};

	// Toggle audio stream
	const toggleAudio = () => {
		isAudioEnabled = !isAudioEnabled;
		const tracks = videocurrent.srcObject.getAudioTracks();
		tracks.forEach((track) => {
			track.enabled = isAudioEnabled;
		});
	};
</script>

<body>
	<div class="header"></div>
	<div class="container">
		<!-- Render video elements when call is active -->
		<div class="video-container">
			<!-- svelte-ignore a11y-media-has-caption -->
			<video bind:this={videocurrent} class="video" autoplay></video>
			<!-- svelte-ignore a11y-media-has-caption -->
			<video bind:this={videoEl} class="video" autoplay></video>
		</div>

		{#if !isCallActive}
			<!-- Render person icon when call is not active -->
			<div class="giant-icon">
				<span class="mdi material-symbols--person"></span>
				<p class="username">{username}</p>
			</div>
		{/if}
	</div>

	<div class="task-bar">
		{#if isCallActive}
			{#if !isVideoEnabled}
				<button on:click={toggleVideo} class="video-button">
					<span class="mdi mdi--video-off icon"></span>
				</button>
			{:else}
				<button on:click={toggleVideo} class="video-button">
					<span class="mdi mdi--video icon"></span>
				</button>
			{/if}

			{#if !isAudioEnabled}
				<button on:click={toggleAudio} class="audio-button">
					<span class="mdi mdi--microphone-off icon"></span>
				</button>
			{:else}
				<button on:click={toggleAudio} class="audio-button">
					<span class="mdi mdi--microphone icon"></span>
				</button>
			{/if}
			<div class="end-call">
				<button on:click={endCall}>
					<span class="material-symbols--call icon"></span>
				</button>
			</div>
		{:else}
			<button class="start-button" on:click={handleCall} disabled={!dataGot || !codeId}>
				<span class="material-symbols--call icon"></span>
				<p>Start a call</p>
			</button>
		{/if}
	</div>

	{#if isReceivingCall}
		<div class="incoming-call">
			<p>Incoming call...</p>
			<button on:click={acceptCall}>Accept</button>
			<button on:click={declineCall}>Decline</button>
		</div>
	{/if}
</body>

<style>
	body {
		margin: 0; /* Remove default margin */
		padding: 0; /* Remove default padding */
		overflow: hidden; /* Prevent scrolling */
	}

	.header {
		position: absolute;
		top: 0;
		width: 100%;
		background-color: var(--darker_van_dyke);
		height: 90px;
		padding: 1rem;
		gap: 10px;
		z-index: 10; /* Ensure header stays above other content */
	}

	.container {
		display: flex;
		flex-direction: column;
		justify-content: center; /* Center vertically */
		align-items: center; /* Center horizontally */
		min-height: 100vh; /* Ensure full viewport height */
		background-color: var(--chamoisee);
		overflow: hidden;
	}

	.giant-icon {
		font-size: 10rem;
		color: var(--light_orange);
		text-align: center; /* Center the icon and text horizontally */
	}

	.username {
		font-size: 2rem;
		margin-top: 1rem; /* Adjust spacing between giant-icon and username */
	}

	.video-container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex: 1;
		width: 100%; /* Ensure full width */
		max-height: calc(100vh - 90px); /* Limit the height to viewport height minus header height */
		overflow: hidden;
	}

	.video {
		width: 45%;
		/* border: 1px solid #ccc; */
		border-radius: 8px;
		margin: 10px;
	}

	.incoming-call {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: var(--light_orange);
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
		z-index: 200; /* Ensure call notification is above other content */
	}

	.incoming-call button {
		margin: 0.5rem;
	}

	.task-bar {
		position: absolute;
		bottom: 10%; /* Adjust the distance from the bottom as needed */
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		background-color: var(--darker_van_dyke);
		border-radius: 16px;
		padding: 10px;
		z-index: 100; /* Ensure it is above other content */
		width: 90%; /* Adjust the width to fit your design */
		max-width: 400px; /* Set a maximum width to prevent it from becoming too wide */
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a subtle shadow for visual effect */
	}

	.video-button,
	.audio-button {
		background-color: var(--yellow_green);
		color: var(--light_orange);
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		margin: 0.5rem;
	}

	.end-call button {
		background-color: var(--off_red);
		color: var(--light_orange);
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		margin: 0.5rem;
	}

	.start-button {
		background-color: var(--yellow_green);
		color: var(--light_orange);
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		margin: 0.5rem;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.start-button p {
		margin-left: 10px;
	}

	.end-call .icon,
	.video-button .mdi,
	.audio-button .mdi {
		color: var(--light_orange);
		font-size: 1.5rem;
	}

	.giant-icon {
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: center; /* Center vertically */
		align-items: center; /* Center horizontally */
		font-size: 5rem; /* Adjust icon size as needed */
		color: var(--light_orange);
		margin-top: auto; /* Push to the top of the remaining space */
	}

	.username {
		font-size: 2rem;
		text-align: center;
		margin-top: 20px; /* Adjust spacing between icon and username */
	}
</style>
