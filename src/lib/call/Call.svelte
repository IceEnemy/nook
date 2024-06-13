<script>
	import { onMount } from 'svelte';
	import Peer from 'peerjs'; // Correctly import the default export from 'peerjs'

	let peer;
	let codeId = '';
	let videocurrent;
	let videoEl;
	let youId = '';

	onMount(() => {
		peer = new Peer();

		peer.on('open', (id) => {
			youId = id;
			console.log(id);
		});

		peer.on('error', (err) => {
			console.log(err);
		});

		peer.on('connection', (conn) => {
			conn.on('data', (data) => {
				console.log('new data', data);
			});
			conn.on('open', () => {
				conn.send('hello');
			});
		});

		peer.on('call', async (call) => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
				call.answer(stream);
				call.on('stream', renderYouWebcam);
				videocurrent.srcObject = stream;
				videocurrent.play();
			} catch (err) {
				console.log('Failed to get local stream', err);
			}
		});
	});

	const renderYouWebcam = (stream) => {
		videoEl.srcObject = stream;
		videoEl.play();
	};

	const handleConnect = async () => {
		const conn = peer.connect(codeId);
		conn.on('data', (data) => {
			console.log('new data', data);
		});
		conn.on('open', () => {
			conn.send('hello');
		});

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			const call = peer.call(codeId, stream);
			videocurrent.srcObject = stream;
			videocurrent.play();
			call.on('stream', renderYouWebcam);
		} catch (err) {
			console.log('Failed to get local stream', err);
		}
	};
</script>

<div>
	Your ID: {youId}
	<br />
	Code: <input type="text" bind:value={codeId} />
	<br />
	<button on:click={handleConnect}>Connect</button>
</div>
<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videocurrent} width="400" height="400" autoplay></video>
<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoEl} width="400" height="400" autoplay></video>
	