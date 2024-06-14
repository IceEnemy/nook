<script>
	import { onMount } from 'svelte';
	import { doc, getDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/firebase.js';
	import { authHandlers } from '$lib/store/store.js';

	export let uid;

	let user = {};

	async function fetchUser() {
		const userRef = doc(db, 'users', uid);
		const userSnap = await getDoc(userRef);
		user = userSnap.data();
	}

	onMount(async () => {
		await fetchUser();
	});

	$: username = user?.username ?? 'Loading...';
	$: profilePic = user?.profilePic ?? 'https://via.placeholder.com/150';

	async function handleAcceptance(accepted) {
		try {
			await authHandlers.handleFriendRequest(uid, accepted);
		} catch (e) {
			console.log(e);
		}
	}
</script>

<div class="contactContainer">
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img src={profilePic} alt="Profile Picture" class="imgContainer" />
	<div class="contactText">
		<h2>{username}</h2>
		<div class="choice">
			<span>Wants to be friends!</span>
			<div class="choiceButtons">
				<button on:click={() => handleAcceptance(true)} class="acceptButton"
					><span class="ion--checkmark-outline icon"></span></button
				>
				<button on:click={() => handleAcceptance(false)} class="denyButton"
					><span class="entypo--cross icon"></span></button
				>
			</div>
		</div>
	</div>
</div>

<style>
	.acceptButton:hover {
		color: var(--yellow_green);
	}
	.denyButton:hover {
		color: var(--imperial_red);
	}
	.choiceButtons {
		gap: 5px;
	}
	.choiceButtons button {
		background-color: transparent;
		border: none;
		cursor: pointer;
	}
	.choice {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.imgContainer {
		width: 50px;
		height: 50px;
	}
	.contactText {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 5px;
	}
	.contactContainer {
		width: 100%;
		padding: 1rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
		border-bottom: solid 1px;
	}
	h2 {
		font-size: 1rem;
		color: var(--van_dyke);
	}
</style>
