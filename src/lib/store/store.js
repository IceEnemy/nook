import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import {writable} from 'svelte/store';
import {auth, db, storage} from '$lib/firebase/firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { set } from 'firebase/database';

//Store to keep track of the user's data, whenever the database is updated, update the store as well.
export const authStore = writable({
    user: null,
    loading: true,
    data: {}
})

//Self explanatory, this is just a function to upload a profile picture to the firebase storage, then take its URL to update user's firestore data.
export async function uploadProfilePicture(file) {
    if (!file) {
        throw new Error("No file provided for upload");
    }

    console.log('Uploading file!');

    

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

export async function updateProfileData(username, DOB, phoneNumber) {
    // if(auth.currentUser === null){
    //     throw new Error('User not logged in');
    //     return;
    // }
    const uid = auth.currentUser.uid;
    // console.log('Updating profile data');
    const userRef = doc(db, 'users', uid);
    await setDoc(
        userRef,
        {username, DOB, phoneNumber},
        {merge: true}
    );

}

//stores all functions relating to authentication, such as signup, login, logout, and forget password. the names of the functions are self explanatory.
export const authHandlers = {
    signup: async (email, pass, username, DOB, phoneNumber) => {

        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

            const user = auth.currentUser;
            let dataToSetToStore;
            console.log('Creating User')
            const userRef = doc(db, 'users', user.uid);
            dataToSetToStore ={
                username,
                profilePic: 'https://placebear.com/250/250',                    
                email,
                DOB,
                phoneNumber,
                notes: []
            }
            await setDoc(
                userRef,
                dataToSetToStore,
                { merge: true }
            )
        } 
        catch (error) {
            let errorMessage = "Signup error: An unexpected error occurred.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'That email address is already in use!';
            }
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'That email address is invalid!';
            }
            
            throw new Error(errorMessage);
        }
            
            // console.log('User: ', user);

            // Create user in firestore

            

            // Wait for profile update to complete before continuing
    },
    login: async (email, pass) => {
        try{
            await signInWithEmailAndPassword(auth,email,pass)
        }
        catch (error) {
            console.log('Error: ', error);
            let errorMessage = "Login error: An unexpected error occurred.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'User doesn\'t exist!';
            }
            else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Those credentials are invalid!';
            }
            else if (error.code === 'auth/wrong-password') {
                errorMessage = 'The password is incorrect!';
            }
            
            throw new Error(errorMessage);
        }
        
    },
    logout: async () => {
        await signOut(auth);
    },
    forgetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email);
    },
    deleteAccount: async () => {
        const user = auth.currentUser;
        await db.collection('users').doc(user.uid).delete();
        const fileRef = storageRef(storage, `profilePics/${user.uid}`);
        await fileRef.delete();
        await user.delete();
    }
}

//store to keep track of the modal state, whether it is open or closed. note: modal is the user settings popup
export const showModal = writable(false);
