<script>
	import { onMount, onDestroy, beforeUpdate } from 'svelte';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db } from '$lib/firebase/firebase.js';
	import { authStore } from '$lib/store/store.js';
	import { authHandlers } from '$lib/store/store.js';
	import { get } from 'svelte/store';

	export let id;

	let uid;
	let otherUser = {};
	let chatArr = [];
	let message = '';
	let unsubscribeChat;

	onMount(() => {
		const user = get(authStore).user;
		if (user) {
			uid = user.uid;
		}
	});

	beforeUpdate(async () => {
		if (id) {
			await fetchOtherUser();
			subscribeToChat();
		}
	});

	async function fetchOtherUser() {
		if (!id) return;

		const chatRef = doc(db, 'chats', id);
		const chatSnap = await getDoc(chatRef);
		const otherUid = chatSnap.data()?.users.find((user) => user !== uid);
		if (otherUid) {
			const otherUserRef = doc(db, 'users', otherUid);
			const otherUserSnap = await getDoc(otherUserRef);
			otherUser = otherUserSnap.data();
		}
	}

	function subscribeToChat() {
		if (unsubscribeChat) {
			unsubscribeChat();
		}
		if (!id) return;

		const chatRef = doc(db, 'chats', id);
		unsubscribeChat = onSnapshot(chatRef, (chatSnap) => {
			if (chatSnap.exists()) {
				chatArr = chatSnap.data().messages;
			}
		});
	}

	$: name = otherUser?.username ?? 'Chat with your friend!';
	$: pfp = otherUser?.profilePic ?? 'https://via.placeholder.com/150';

	async function handleSendMessage() {
		try {
			await authHandlers.sendMessage(id, message);
			message = '';
		} catch (e) {
			console.log(e);
			message = '';
		}
	}

	onDestroy(() => {
		if (unsubscribeChat) {
			unsubscribeChat();
		}
	});
</script>

<div class="chatContainer">
	<div class="chatHeader">
		<img src={pfp} alt="" class="imgContainer" />
		<h1>{name}</h1>
	</div>

	<div class="chatContent">
		{#each chatArr as chat}
			<div class={chat.sender == uid ? 'myChat' : 'otherChat'}>
				<p>{chat.message}</p>
			</div>
		{/each}
	</div>

	<div class="chatFooter">
		<form on:submit|preventDefault={handleSendMessage}>
			<label>
				<input type="text" placeholder="Type a message" bind:value={message} />
			</label>
			<button><span class="majesticons--send icon"></span></button>
		</form>
	</div>
</div>

<style>
	.myChat,
	.otherChat {
		width: 350px;
		border-radius: 10px;
		padding: 0.5rem;
		word-break: break-word;
		overflow-wrap: break-word;
	}
	.myChat {
		background-color: var(--coyote);
		color: var(--default_white);
		align-self: flex-end;
	}
	.otherChat {
		background-color: var(--default_white);
		color: var(--darker_van_dyke);
	}
	h1 {
		color: var(--default_white);
	}
	.imgContainer {
		width: 50px;
		height: 50px;
	}
	.chatFooter form {
		width: 90%;
		height: 2rem;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.chatFooter button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
	}
	.chatFooter input {
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		border-radius: 100px;
	}
	.chatFooter label {
		width: 95%;
		border-radius: 100px;
	}
	.chatContent {
		flex-grow: 1;
		padding: 3rem;
		overflow-y: scroll;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.chatHeader {
		background-color: var(--darker_van_dyke);
		width: 100%;
		height: 90px;
		padding: 1rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
	}
	.chatFooter {
		background-color: var(--default_white);
		width: 100%;
		height: 70px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	.chatContainer {
		background: var(--chamoisee);
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
