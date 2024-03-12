import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import {writable} from 'svelte/store';
import {auth, db, storage} from '$lib/firebase/firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { set } from 'firebase/database';

export const authStore = writable({
    user: null,
    loading: true,
    data: {}
})

export async function uploadProfilePicture(file) {
    if (!file) {
        throw new Error("No file provided for upload");
    }

    

    const uid = auth.currentUser.uid;

    const fileRef = storageRef(storage, `profilePics/${uid}`);

    const snapshot = await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    const userRef = doc(db, 'users', uid);
    await setDoc(
        userRef,
        {profilePic: photoURL},
        {merge: true}
    );

}

export const authHandlers = {
    signup: async (email, pass, username) => {
        try {
            
            try{
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            } 
            catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    alert('That email address is already in use!');
                    throw new Error('That email address is already in use!');
                }
                else{
                    console.error("Signup error: ", error);
                    throw new Error('Signup error: ' + error);
                }
                
            }
            const user = auth.currentUser;
            console.log('User: ', user);

            let dataToSetToStore;
            console.log('Creating User')
            const userRef = doc(db, 'users', user.uid);
            dataToSetToStore ={
                username,
                profilePic: 'https://placebear.com/250/250',                    
                email,
                notes: []
            }
            await setDoc(
                userRef,
                dataToSetToStore,
                { merge: true }
            )

            // Wait for profile update to complete before continuing

            
            
            // await updateProfile(userCredential.user, {displayName: username, photoURL: 'https://placebear.com/250/250'});
            // Now the profile is updated, you can handle redirection or further actions here
        } catch (error) {
            console.error("Signup error: ", error);
        }
    },
    login: async (email, pass) => {
        await signInWithEmailAndPassword(auth,email,pass)
    },
    logout: async () => {
        await signOut(auth);
    }
}

export const showModal = writable(false);

// 'https://placebear.com/250/250'