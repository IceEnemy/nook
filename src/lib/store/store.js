import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import {writable} from 'svelte/store';
import {auth, db, storage} from '$lib/firebase/firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';


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

    
    try{
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
    catch{
        let errorMessage = 'Profile picture upload failed';
        throw new Error(errorMessage);
    }
    

}

export async function updateProfileData(username, DOB, phoneNumber) {
    // if(auth.currentUser === null){
    //     throw new Error('User not logged in');
    //     return;
    // }
    try{
        const uid = auth.currentUser.uid;
        const userRef = doc(db, 'users', uid);
        await setDoc(
            userRef,
            {username, DOB, phoneNumber},
            {merge: true}
        );
    }
    catch{
        let errorMessage = 'Profile update failed';
        throw new Error(errorMessage);
    }
    

}

//stores all functions relating to authentication, such as signup, login, logout, and forget password. the names of the functions are self explanatory.
export const authHandlers = {
    signup: async (email, pass, username, DOB, phoneNumber = '') => {

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
                firstName: '',
                lastName: '',
                DOB,
                phoneNumber,
                accCreationDate: serverTimestamp(),
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
    login: async (email, pass, rememberMe) => {
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        try{
            await setPersistence(auth, persistenceType);
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
        showModal.set(false);
    },
    resetPassword: async (email) => {
        try{
            await sendPasswordResetEmail(auth, email);
        }
        catch{
            let errorMessage = 'Password reset failed';
            throw new Error(errorMessage);
        }
    },
    deleteAccount: async () => {
        try{
            console.log('1')
            const user = auth.currentUser;
            console.log('2')
            await deleteDoc(doc(db, 'users', user.uid));
            console.log('3')
            const fileRef = storageRef(storage, `profilePics/${user.uid}`);
            console.log('4')
            await deleteObject(fileRef);
            console.log('5')
            await user.delete();
            console.log('6')
        }
        catch{
            let errorMessage = 'Account deletion failed';
            throw new Error(errorMessage);
        }
        
    },
    updateEmail: async (email) => {
        try{
            await verifyBeforeUpdateEmail(auth.currentUser, email);
        }
        catch{
            let errorMessage = 'Email update failed';
            throw new Error(errorMessage);
        }
    },
    updatePassword: async (newPassword) => {
        try{
            await updatePassword(auth.currentUser, newPassword);
        }
        catch{
            let errorMessage = 'Password update failed';
            throw new Error(errorMessage);
        }
    },
    reauthenticate: async(password) => {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        try{
            await reauthenticateWithCredential(auth.currentUser, credential);
            userReauthenticated.set(true);
            return true;
        }
        catch{
            console.log('Reauth failed');
            userReauthenticated.set(false);
            return false;
        }
        
    }

}

export const passwordRequirements = {
    complete: (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]{8,}$/;
        return passwordRegex.test(password);
    },
    length: (password) => {
        return password.length >= 8;
    },
    uppercase: (password) => {
        const passwordRegex = /^(?=.*[A-Z])/;
        return passwordRegex.test(password);
    },
    lowercase: (password) => {
        const passwordRegex = /^(?=.*[a-z])/;
        return passwordRegex.test(password);
    },
    number: (password) => {
        const passwordRegex = /^(?=.*\d)/;
        return passwordRegex.test(password);
    },
    special: (password) => {
        const passwordRegex = /^(?=.*[^A-Za-z\d\s])/;
        return passwordRegex.test(password);
    }
}
// function passwordUppercase(password){
//     const passwordRegex = /^(?=.*[A-Z])/;
//     return passwordRegex.test(password);
// }

// function passwordLowercase(password){
//     const passwordRegex = /^(?=.*[a-z])/;
//     return passwordRegex.test(password);
// }

// function passwordNumber(password){
//     const passwordRegex = /^(?=.*\d)/;
//     return passwordRegex.test(password);
// }

// function passwordSpecial(password){
//     const passwordRegex = /^(?=.*[^A-Za-z\d\s])/;
//     return passwordRegex.test(password);
// }

//store to keep track of the modal state, whether it is open or closed. note: modal is the user settings popup
export const showModal = writable(false);
export const userReauthenticated = writable(false);