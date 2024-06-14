<script>
	import Timer from '$lib/timer/Timer.svelte';
	import { authStore } from '$lib/store/store.js';
	import { doc, addDoc, collection, setDoc, getDoc, getDocs } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase.js';

	let timerArray = [];
	let timerGot = false;

	async function getTimers() {
		const user = $authStore.user;
		const timerCollection = collection(db, 'users', user.uid, 'timers');

		try {
			const querySnapshot = await getDocs(timerCollection);
			timerArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			console.log(timerArray); // To verify the fetched data
		} catch (error) {
			console.error('Error fetching timers: ', error);
		}
		console.log(timerArray);
		timerGot = true;
		console.log('hi');
	}

	$: if ($authStore.user) {
		getTimers();
	}
</script>

<div class="header">
	<h1>Pomodoro Timer</h1>
</div>

{#if timerGot}
	<div class="Timers">
		{#each timerArray as timer}
			<Timer
				id={timer.id}
				name={timer.title}
				workTime={timer.workTime}
				breakTime={timer.breakTime}
				lapAmount={timer.lapCount}
			/>
		{/each}
	</div>
{/if}

<style>
	.Timers {
		display: flex;
		justify-content: space-around;
		align-items: center;
		margin-top: 110px;
	}

	.header {
		color: var(--default_white);
		position: absolute;
		display: flex;
		/* justify-content: center; */
		align-items: center;
		height: 90px;
		width: calc(100vw - 18rem);
		padding-left: 40px;
		top: 0;
		left: 0;
		background-color: var(--darker_van_dyke);
	}
</style>
