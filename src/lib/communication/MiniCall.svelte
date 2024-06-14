<script>
	import { onMount } from 'svelte';
	import Peer from 'peerjs';
	import { onAuthStateChanged } from 'firebase/auth';
	import { auth } from '$lib/firebase/firebase';
	import { writable } from 'svelte/store';

	$: userId = auth.currentUser.uid;

	export let targetId;

	let peer;
	$: codeId = targetId;
	let videocurrent;
	let videoEl;
	let youId = '';
	let incomingCall = null;
	let isReceivingCall = false;

	export let onAcceptCall;
	export let onDeclineCall;

	onMount(() => {
		peer = new Peer(userId);

		peer.on('open', (id) => {
			youId = id;
			console.log('Your peer ID:', id);
		});

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
		});
	});

	const renderYouWebcam = (stream) => {
		videoEl.srcObject = stream;
		videoEl.play();
	};

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
			});
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
			onAcceptCall(); // Call the parent component's function to handle accepted call
		} catch (err) {
			console.error('Failed to accept the call', err);
		}
	};

	const declineCall = () => {
		incomingCall = null;
		isReceivingCall = false;
		onDeclineCall(); // Call the parent component's function to handle declined call
	};
</script>

Your ID: {youId}
<div>
	<button on:click={handleCall} disabled={!codeId}>Call</button>
</div>

{#if isReceivingCall}
	<div class="incoming-call">
		<p>Incoming call...</p>
		<button on:click={acceptCall}>Accept</button>
		<button on:click={declineCall}>Decline</button>
	</div>
{/if}

<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videocurrent} width="400" height="400" autoplay></video>
<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoEl} width="400" height="400" autoplay></video>
