<script>
	import { onMount, onDestroy } from 'svelte';
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import {
		doc,
		getDoc,
		onSnapshot,
		setDoc,
		collection,
		addDoc,
		updateDoc,
		arrayUnion
	} from 'firebase/firestore';
	import { db, auth } from '$lib/firebase/firebase';
	import { calendarStore } from '$lib/store/calendar.js';

	// State variables
	let formData = { title: '', start: '', end: '', color: '#A3A37C' }; // Form data
	let showModal = false; // State variable to control modal visibility
	let showDropdown = false; // State variable to control dropdown visibility
	let dropdownEvent = null; // Store the event data for the dropdown
	let docSnap;
	let dataGot = false;
	let eventArr = [];
	let unsubscribe;
	let plugins = [TimeGrid, DayGrid];
	let options = {
		defaultView: 'timeGridWeek',
		customButtons: {
			addEvent: {
				text: 'new event',
				click: toggleForm
			}
		},
		views: {
			timeGridWeek: { pointer: true, height: '800px' },
			resourceTimeGridWeek: { pointer: true },
			resourceTimelineWeek: {
				pointer: true,
				slotWidth: 80,
				resources: Array.from({ length: 15 }, (_, i) => ({
					id: i + 1,
					title: `Resource ${String.fromCharCode(65 + i)}`
				}))
			},
			timeGridDay: { pointer: true, slotDuration: '01:00', height: '1000px' }
		},
		events: eventArr,
		slotDuration: '01:00',
		headerToolbar: {
			start: 'prev,next today addEvent',
			center: 'title',
			end: 'timeGridDay,timeGridWeek,dayGridMonth'
		},
		resources: [
			{ id: 1, title: 'Resource A' },
			{ id: 2, title: 'Resource B' }
		],
		editable: true,
		nowIndicator: true,
		selectable: true,
		height: '600px',
		// slotHeight: '50px',
		slotWidth: 60,
		eventClick: handleDropdown
	};

	onMount(() => {
		getEventData();
		populateDays();
	});

	async function getEventData() {
		dataGot = false;

		if (unsubscribe) unsubscribe();

		try {
			const userId = auth.currentUser?.uid;
			if (!userId) throw new Error('User not authenticated');

			const docRef = doc(db, 'users', userId);

			unsubscribe = onSnapshot(docRef, async (docSnap) => {
				dataGot = false;
				eventArr = await fillArrays(docSnap);
				console.log('eventArr', eventArr);

				if (Array.isArray(options.events)) {
					options.events = options.events.concat(eventArr);
				} else {
					options.events = eventArr;
				}
				dataGot = true;

				console.log('Event Data loaded and arrays filled');
			});
		} catch (error) {
			console.error('Error getting event data:', error);
		}
	}

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	function populateDays() {
		let days = [];
		let today = new Date();
		let year = today.getFullYear();

		// Loop through each month of the year
		for (let month = 0; month < 12; month++) {
			let firstDay = new Date(year, month, 1);
			let lastDay = new Date(year, month + 1, 0); // Last day of the current month

			// Loop through each day of the month
			for (let day = firstDay; day <= lastDay; day.setDate(day.getDate() + 1)) {
				days.push(day.getFullYear() + '-' + _pad(day.getMonth() + 1) + '-' + _pad(day.getDate()));
			}
		}

		return days;
	}

	let days = populateDays();

	async function fillArrays(docSnap) {
		try {
			let events = [];
			const eventRefs = docSnap.data()?.events;
			for (const event of eventRefs) {
				const eventDoc = await getDoc(doc(db, 'events', event.eventId));
				if (eventDoc.exists()) {
					events.push({ ...eventDoc.data(), eventId: event.eventId });
				}
			}
			return events;
		} catch (error) {
			console.error('Error filling arrays:', error);
			return [];
		}
	}

	function _pad(num) {
		let norm = Math.floor(Math.abs(num));
		return (norm < 10 ? '0' : '') + norm;
	}

	function toggleForm() {
		showModal = !showModal;
	}

	// Function to handle form submission
	async function handleSubmit() {
		try {
			// Add validation and submission logic here
			let newEvent = {
				title: formData.title,
				start: formData.start,
				end: formData.end,
				color: formData.color
			};
			console.log('New Event:', newEvent);

			newEvent = convertEvent(newEvent, days);

			// Add event to calendar
			await calendarStore.addEvent(newEvent.title, newEvent.start, newEvent.end, newEvent.color);

			// Reset the form data
			formData = { title: '', start: '', end: '', color: '' };

			// Hide the form
			toggleForm();
		} catch (error) {
			console.error('Error adding event:', error);
		}
	}

	async function onCancel() {
		formData = { title: '', start: '', end: '', color: '' };
		toggleForm();
	}

	function convertEvent(input, days) {
		// Extract date and time parts from the input object
		let startDateTime = new Date(input.start);
		let endDateTime = new Date(input.end);

		// Format date parts
		let startDate =
			startDateTime.getFullYear() +
			'-' +
			_pad(startDateTime.getMonth() + 1) +
			'-' +
			_pad(startDateTime.getDate());
		let startTime = _pad(startDateTime.getHours()) + ':' + _pad(startDateTime.getMinutes());

		let endDate =
			endDateTime.getFullYear() +
			'-' +
			_pad(endDateTime.getMonth() + 1) +
			'-' +
			_pad(endDateTime.getDate());
		let endTime = _pad(endDateTime.getHours()) + ':' + _pad(endDateTime.getMinutes());

		// Find the index in the days array
		let startIndex = days.indexOf(startDate);
		let endIndex = days.indexOf(endDate);

		if (startIndex === -1 || endIndex === -1) {
			throw new Error('Date not found in days array');
		}

		// Create new event object
		const newEvent = {
			title: input.title,
			start: days[startIndex] + ' ' + startTime,
			end: days[endIndex] + ' ' + endTime,
			color: input.color
		};

		console.log('Converted Event:', newEvent);

		return newEvent;
	}
	
	function handleDropdown(event) {
		// console.log('Event:', event);
		// showDropdown = true;
		// dropdownEvent = {
		// 	...event,
		// 	id: event.eventId // Set id to eventId
		// };
		// console.log('Dropdown Event:', dropdownEvent); // Check dropdownEvent properties including eventId
		// // Position dropdown based on event
	}

	async function handleEditEvent() {
		if (!dropdownEvent) return;
		formData = {
			title: dropdownEvent.title,
			start: dropdownEvent.start,
			end: dropdownEvent.end,
			color: dropdownEvent.color
		};
		showModal = true;
		showDropdown = false;
	}

	async function handleDeleteEvent() {
		if (!dropdownEvent) return;
		try {
			console.log('Deleting event:', dropdownEvent.title, ' with ID:', dropdownEvent.eventId);
			await calendarStore.deleteEvent(dropdownEvent.eventId);
			console.log('Event deleted:', dropdownEvent.eventId);
			showDropdown = false;
		} catch (error) {
			console.error('Error deleting event:', error);
		}
	}

	function clickOutside(node) {
		const handleClick = (event) => {
			if (node && !node.contains(event.target) && !event.defaultPrevented) {
				showDropdown = false;
			}
		};

		const handleEscape = (event) => {
			if (event.key === 'Escape' || event.keyCode === 27) {
				showDropdown = false;
			}
		};

		document.addEventListener('click', handleClick, true);
		document.addEventListener('keydown', handleEscape, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
				document.removeEventListener('keydown', handleEscape, true);
			}
		};
	}
</script>

<Calendar {plugins} {options} />

{#if showModal}
	<div class="popup-form">
		<div class="popup-content">
			<h2 style="margin-bottom: 10px;">Event Details</h2>
			<div class="input-container">
				<label for="title">Title:</label>
				<input id="title" type="text" bind:value={formData.title} placeholder="Enter title" />
			</div>

			<div class="input-container">
				<label for="start">Start Date and Time:</label>
				<input id="start" type="datetime-local" bind:value={formData.start} />
			</div>

			<div class="input-container">
				<label for="end">End Date and Time:</label>
				<input id="end" type="datetime-local" bind:value={formData.end} />
			</div>

			<div class="input-container">
				<label for="color">Select Color:</label>
				<input id="color" type="color" bind:value={formData.color} />
			</div>

			<div class="button-container">
				<button id="confirm" on:click={handleSubmit}>Submit</button>
				<button id="cancel" on:click={onCancel}>Cancel</button>
			</div>
		</div>
	</div>
{/if}

{#if showDropdown && dropdownEvent}
	<div class="dropdown-menu" use:clickOutside>
		<button on:click={handleEditEvent}>Edit</button>
		<button on:click={handleDeleteEvent}>Delete</button>
	</div>
{/if}

<style>
	.popup-form {
		display: block;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		z-index: 9999;
	}

	.input-container {
		margin-bottom: 10px;
	}
	.button-container button {
		flex: 1;
		margin: 5px;
		padding: 8px 12px;
		border-radius: 8px;
		border: none;
	}
	#confirm {
		background-color: var(--coyote);
		color: var(--navbar_contrast_text);
	}
	#cancel {
		background-color: var(--off_red);
		color: var(--app_bg);
	}

	.dropdown-menu {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		z-index: 1000;
	}

	.dropdown-menu button {
		display: block;
		width: 100%;
		padding: 8px 16px;
		border: none;
		background: none;
		cursor: pointer;
	}

	.dropdown-menu button:hover {
		background: #f1f1f1;
	}
</style>
