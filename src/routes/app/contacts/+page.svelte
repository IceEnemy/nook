<script>
	import Contact from '$lib/communication/Contact.svelte';
	import FriendRequest from '$lib/communication/FriendRequest.svelte';
	import Chat from '$lib/communication/Chat.svelte';
	import { authHandlers } from '$lib/store/store.js';
	import { authStore } from '$lib/store/store.js';
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase/firebase.js';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';

	let contactArr = [];
	let friendRequestArr = [];
	let filter = '';
	let uid = '';
	let chatId = '';

	$: console.log(chatId);

	async function updateData(snapshot) {
		const userData = snapshot.data();
		const contacts = userData.contacts || [];
		const friendRequests = userData.friendRequest || [];

		contactArr = await Promise.all(
			contacts.reverse().map(async (contact) => {
				const userDoc = await getDoc(doc(db, 'users', contact.uid));
				return { ...contact, username: userDoc.exists() ? userDoc.data().username : 'Unknown' };
			})
		);

		friendRequestArr = await Promise.all(
			friendRequests.reverse().map(async (friendRequest) => {
				const userDoc = await getDoc(doc(db, 'users', friendRequest));
				return {
					uid: friendRequest,
					username: userDoc.exists() ? userDoc.data().username : 'Unknown'
				};
			})
		);

		console.log(contactArr);
		console.log(friendRequestArr);
	}

	function handleContactClick(id) {
		chatId = id;
	}

	$: filteredContacts = contactArr.filter((contact) =>
		contact.username.toLowerCase().includes(filter.toLowerCase())
	);

	$: filteredFriendRequests = friendRequestArr.filter((friendRequest) =>
		friendRequest.username.toLowerCase().includes(filter.toLowerCase())
	);

	onMount(() => {
		const userRef = doc(db, 'users', $authStore.user.uid);
		const unsubscribe = onSnapshot(userRef, (snapshot) => {
			if (snapshot.exists()) {
				updateData(snapshot);
			} else {
				console.log('No such document!');
			}
		});

		return () => {
			unsubscribe();
		};
	});

	async function addFriend() {
		try {
			await authHandlers.sendFriendRequest(uid);
			uid = '';
		} catch (e) {
			console.log(e);
			uid = '';
		}
	}
</script>

<div class="wholeContacts">
	<div class="contactsList">
		<div class="msgHeader">
			<h1>Contacts</h1>
			<label class="searchContact">
				<span class="ic--round-search icon"></span>
				<input type="text" class="search" placeholder="Search contact" bind:value={filter} />
			</label>
		</div>

		<div class="msgs">
			{#each filteredContacts as contact}
				<Contact
					id={contact.chatId}
					uid={contact.uid}
					lastMessage={contact.lastMessage}
					username={contact.username}
					chosen={contact.chatId == chatId ? true : false}
					onClick={handleContactClick}
				/>
			{/each}
			{#each filteredFriendRequests as friendRequest}
				<FriendRequest uid={friendRequest.uid} username={friendRequest.username} />
			{/each}
		</div>

		<div class="addContacts">
			<form class="addForm" on:submit|preventDefault={addFriend}>
				<label>
					<input type="text" placeholder="Add friend (uid)" bind:value={uid} />
				</label>
				<button><span class="ph--plus-bold icon"></span></button>
			</form>
		</div>
	</div>
	<Chat id={chatId} />
</div>

<style>
	.addForm label {
		width: 80%;
		border-radius: 500px;
		background-color: var(--default_white);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.addForm input {
		padding: 0.5rem 0.5rem 0.5rem 1rem;
		border-radius: 500px;
	}
	.addForm button {
		background-color: transparent;
		border: none;
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	.addForm {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.addContacts {
		width: 100%;
		height: 70px;
		padding: 1rem;
		background-color: var(--dim_linen);
		display: flex;
		align-items: center;
	}
	.wholeContacts {
		width: 100%;
		height: 100%;
		display: flex;
	}
	.msgHeader {
		width: 100%;
		height: 15%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		justify-content: center;
		align-items: center;
        margin-bottom: 16px;
	}
	.search {
		width: 85%;
		height: 100%;
		border-radius: 10px;
		background-color: transparent;
		font-size: 1rem;
		border: none;
		color: var(--van_dyke);
	}
	.searchContact {
		width: 80%;
		height: 3rem;
		border-radius: 10px;
		border: solid var(--dun) 1px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--default_white);
        padding-block: 4px;
	}
	.contactsList {
		width: 500px;
		height: 100%;
		background-color: var(--linen);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.msgs {
		width: 100%;
		overflow-y: scroll;
		flex-grow: 1;
	}
	h1 {
		color: var(--van_dyke);
		margin-top: 2rem;
	}
	.ic--round-search {
		margin-left: 10px;
	}
	.search::placeholder {
		color: var(--chamoisee);
	}

	/* For WebKit-based browsers */
	.msgs::-webkit-scrollbar {
		width: 0; /* Remove scrollbar width */
	}

	.msgs::-webkit-scrollbar-thumb {
		background-color: transparent; /* Make scrollbar thumb transparent */
	}
</style>
