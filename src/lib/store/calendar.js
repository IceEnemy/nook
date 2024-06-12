import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { writable } from 'svelte/store';
import { auth, db, storage, rtdb } from '$lib/firebase/firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, getDoc } from 'firebase/firestore';
import { get, push, ref, set, remove } from 'firebase/database';
import { events } from '$lib/calendar/packages/core/src/storage/stores';



export const calendarStore = {
    addEvent: async (title, start, end, color) => {
        const user = auth.currentUser;

        console.log("title", title, "start", start, "end", end, "color", color, "user", user.uid);
        let eventId;
        let dataToSetToStore;
        let firebaseRef;

        firebaseRef = collection(db, 'events');

        dataToSetToStore = {
            title,
            start,
            end,
            owner: user.uid,
            color,
        };

        const docRef = await addDoc(firebaseRef, dataToSetToStore);
        eventId = docRef.id;

        const refData = {
            eventId,
        };

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(
            userRef,
            { events: arrayUnion(refData) }
        );

        // once done navigate to the event
        console.log('Event added successfully');
    },
    deleteEvent: async (eventId) => {
        try {
            const user = auth.currentUser;
            const userRef = doc(db, 'users', user.uid);
            const eventRef = doc(db, 'events', eventId);

            await deleteDoc(eventRef);
            await updateDoc(
                userRef,
                { events: arrayRemove({ eventId }) }
            );

            console.log(`Event ${eventId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    },
}