<script>
    import { onMount } from 'svelte';
    import { doc, getDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase/firebase.js';

    export let uid;
    export let id;
    export let chosen = false;
    export let lastMessage = 'No messages yet';
    export let onClick; // New prop for the click handler

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
</script>

<div class="contactContainer {chosen ? "chosen" : ""}" on:click={() => onClick(id)}>
    <img src={profilePic} alt="Profile Picture" class="imgContainer">
    <div class="contactText">
        <h2>{username}</h2>
        <p>{lastMessage}</p>
    </div>
</div>

<style>
    .imgContainer {
        width: 50px;
        height: 50px;
    }
    .contactText {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .contactText p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .contactContainer {
        width: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        border-bottom: solid 1px;
        background-color: var(--linen);
        cursor: pointer;
    }
    .contactContainer:hover {
        background-color: var(--dim_linen);
    }
    .chosen {
        background-color: var(--dim_linen);
        cursor: default;
    }
    h2 {
        font-size: 1rem;
        color: var(--van_dyke);
    }
</style>
