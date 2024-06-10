<script>
	import { onMount } from 'svelte';
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import { doc, getDoc, onSnapshot } from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';

	let docSnap;
	let plugins = [TimeGrid, DayGrid];
	let options = {
		defaultView: 'timeGridWeek', // Set default view to week display
		views: {
			timeGridWeek: { pointer: true },
			resourceTimeGridWeek: { pointer: true },
			resourceTimelineWeek: {
				pointer: true,
				slotWidth: 80,
				resources: [
					{ id: 1, title: 'Resource A' },
					{ id: 2, title: 'Resource B' },
					{ id: 3, title: 'Resource C' },
					{ id: 4, title: 'Resource D' },
					{ id: 5, title: 'Resource E' },
					{ id: 6, title: 'Resource F' },
					{ id: 7, title: 'Resource G' },
					{ id: 8, title: 'Resource H' },
					{ id: 9, title: 'Resource I' },
					{ id: 10, title: 'Resource J' },
					{ id: 11, title: 'Resource K' },
					{ id: 12, title: 'Resource L' },
					{ id: 13, title: 'Resource M' },
					{ id: 14, title: 'Resource N' },
					{ id: 15, title: 'Resource O' }
				]
			}
		},
		events: createEvents(),
		slotDuration: '01:00',
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'timeGridDay,timeGridWeek,dayGridMonth'
		},
		resources: [
			{ id: 1, title: 'Resource A' },
			{ id: 2, title: 'Resource B' }
		],
		editable: true,
		nowIndicator: true,
		selectable: true
	};

	// async function getNoteData() {
	// 	dataGot = false;

	// 	if (unsubscribe) unsubscribe();

	// 	const docRef = ref ? doc(db, 'events', ref) : doc(db, 'users', auth.currentUser.uid);

	// 	unsubscribe = onSnapshot(docRef, (doc) => {
	// 		dataGot = false;
	// 		docSnap = doc;
	// 		// Wait for fillArrays to complete before setting dataGot to true
	// 		fillArrays()
	// 			.then(() => {
	// 				dataGot = true;
	// 				console.log('Data loaded and arrays filled');
	// 			})
	// 			.catch((error) => {
	// 				console.error('Error filling arrays:', error);
	// 				dataGot = false; // Consider setting to false or handling error state
	// 			});
	// 	});
	// }
	// onDestroy(() => {
	// 	if (unsubscribe) return unsubscribe();
	// });

	// async function fillArrays() {
	// 	eventArr = [];
	// 	const events = docSnap.data().events;
	// 	for (const event of events) {
	// 			const eventDoc = await getDoc(doc(db, 'events', event.eventId));
	// 			eventArr.push({ ...eventDoc.data(), eventId: event.eventId });
	// 			console.log(event);
	// 	}
	// }

	function _pad(num) {
		let norm = Math.floor(Math.abs(num));
		return (norm < 10 ? '0' : '') + norm;
	}
</script>

<Calendar {plugins} {options} />
