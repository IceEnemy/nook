import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import {writable} from 'svelte/store';
import {auth} from '$lib/firebase/firebase.js'

export const authStore = writable({
    user: null,
    loading: true,
    data: {}
})

export const authHandlers = {
    signup: async (email, pass, username) => {
        await createUserWithEmailAndPassword(auth, email, pass)
            .then((userCredential) => {
                // The user has been created and is now signed in, so you can update their profile
                return updateProfile(userCredential.user, {displayName: username, photoURL: 'https://placekitten.com/250/250'});
            })
            .catch((error) => {
                // Handle errors here, such as logging them or informing the user
                console.error("Signup error: ", error);
            });
    },
    login: async (email, pass) => {
        await signInWithEmailAndPassword(auth,email,pass)
    },
    logout: async () => {
        await signOut(auth);
    }
}