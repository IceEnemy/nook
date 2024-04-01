import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import {writable} from 'svelte/store';
import {auth, db, storage, rtdb} from '$lib/firebase/firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection} from 'firebase/firestore';
import { get, push, ref, set } from 'firebase/database';


//Store to keep track of the user's data, whenever the database is updated, update the store as well.
export const authStore = writable({
    user: null,
    loading: true,
    data: {}
})

function loadingState(state){
    authStore.update(store => {
        return { ...store, loading: state }
    })

}

//Self explanatory, this is just a function to upload a profile picture to the firebase storage, then take its URL to update user's firestore data.
export async function uploadProfilePicture(file) {
    if (!file) {
        throw new Error("No file provided for upload");
    }

    console.log('Uploading file!');
    loadingState(true);
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
        loadingState(false);
        throw new Error(errorMessage);
    }
    loadingState(false);

}

export async function updateProfileData(username, DOB, phoneNumber) {
    // if(auth.currentUser === null){
    //     throw new Error('User not logged in');
    //     return;
    // }
    loadingState(true);
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
        loadingState(false);
        throw new Error(errorMessage);
    }
    loadingState(false);

}

//stores all functions relating to authentication, such as signup, login, logout, and forget password. the names of the functions are self explanatory.
export const authHandlers = {
    signup: async (email, pass, username, DOB, phoneNumber = '') => {
        loadingState(true);

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
            loadingState(false);
            
            throw new Error(errorMessage);
        }
            
        loadingState(false);
    },
    login: async (email, pass, rememberMe) => {
        const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        loadingState(true);
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
            loadingState(false);
            
            throw new Error(errorMessage);
        }
        loadingState(false);
        
    },
    logout: async () => {
        loadingState(true);
        await signOut(auth);
        showModal.set(false);
        loadingState(false);
    },
    resetPassword: async (email) => {
        loadingState(true);
        try{
            await sendPasswordResetEmail(auth, email);
        }
        catch{
            let errorMessage = 'Password reset failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
    deleteAccount: async () => {
        loadingState(true);
        try{
            // console.log('1')
            const user = auth.currentUser;
            // console.log('2')
            await deleteDoc(doc(db, 'users', user.uid));
            // console.log('3')
            const fileRef = storageRef(storage, `profilePics/${user.uid}`);
            // console.log('4')
            await deleteObject(fileRef);
            // console.log('5')
            await user.delete();
            // console.log('6')
        }
        catch{
            let errorMessage = 'Account deletion failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
        
    },
    updateEmail: async (email) => {
        loadingState(true);
        try{
            await verifyBeforeUpdateEmail(auth.currentUser, email);
        }
        catch{
            let errorMessage = 'Email update failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
    updatePassword: async (newPassword) => {
        loadingState(true);
        try{
            await updatePassword(auth.currentUser, newPassword);
        }
        catch{
            let errorMessage = 'Password update failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
    reauthenticate: async(password) => {
        loadingState(true);
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        try{
            await reauthenticateWithCredential(auth.currentUser, credential);
            userReauthenticated.set(true);
            loadingState(false);
            return true;
        }
        catch{
            console.log('Reauth failed');
            userReauthenticated.set(false);
            loadingState(false);
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

// function getExampleRef() {
//     var ref = firebase.database().ref();
//     var hash = window.location.hash.replace(/#/g, '');
//     if (hash) {
//       ref = ref.child(hash);
//     } else {
//       ref = ref.push(); // generate unique location.
//       window.location = window.location + '#' + ref.key; // add it as a hash to the URL.
//     }
//     if (typeof console !== 'undefined') {
//       console.log('Firebase data: ', ref.toString());
//     }
//     return ref;
//   }

function updateNoteFromPath(path, op){
    let result
    const unsubscribe = authStore.subscribe(storeValue => {
        result = storeValue.data.notes
    })
    unsubscribe();
    // let result = JSON.parse(JSON.stringify(authStore.data?.notes || []))
    let curNote = result;
    console.log(result)
    // if(path.length == 0)
    // {
    //     op(curNote)
    //     console.log(result)
    // } 
    // else{
        for(let i = 0; i < path.length; i++){
            const id = path[i];
            let foundNote = curNote.find(note => note.noteId == id);
            console.log(foundNote)
            // if(i == path.length - 1){
            //     op(foundNote)
            // }
            if(foundNote.type == 'folder'){
                curNote = foundNote.notes;
            }
            else{
                throw new Error('Invalid path');
            }
        }
    // }
    op(curNote)
    console.log(result)
    return result;
}

export const updateNoteStore = {
    newNote: async (title, path = [], type) => {
        // loadingState(true);

        const user = auth.currentUser;
        // try{
            console.log('3')
            const userRef = doc(db, 'users', user.uid);
            console.log('5')
            if(type == 'note'){
                const noteDB = ref(rtdb);
                console.log('1')
                // console.log(authStore.data.notes)
                console.log('2')
                const newNoteRef = push(noteDB)
                const noteId = newNoteRef.key;
                console.log(noteId)
                const dataToSetToStore = {
                    noteId,
                    title,
                    type,
                    owner: user.uid,
                    invitedUsers: [user.uid],
                    permission: 'invite',
                    created: Date.now(),
                    lastEdited: Date.now(),
                }

                const noteUpdate = updateNoteFromPath(path, (note) => {
                    if(note.find(note => note.noteId == noteId)){
                        console.log("note exists")
                        throw new Error('Note already exists');
                    }
                    note.push(dataToSetToStore)
                })

                await updateDoc(userRef, {
                    notes: noteUpdate
                })

            }
            else if(type == 'folder'){

                const dataToSetToStore = {
                    noteId : title,
                    title,
                    type,
                    owner: user.uid,
                    invitedUsers: [user.uid],
                    permission: 'invite',
                    notes: [],
                    created: Date.now(),
                    lastEdited: Date.now(),
                }
                // const noteUpdate = updateNoteFromPath(path, (note) => {
                //     note.push(dataToSetToStore)})

                    const noteUpdate = updateNoteFromPath(path, (note) => {
                        if(note.find(note => note.noteId == dataToSetToStore.noteId)){
                            console.log("note exists")
                            throw new Error('Folder already exists');
                            return
                        }
                        note.push(dataToSetToStore)
                    })
    
                    await updateDoc(userRef, {
                        notes: noteUpdate
                    })
            }
            // window.location = window.location + '#' + noteId;
        // }
        // catch{
        //     let errorMessage = 'Note creation failed';
        //     loadingState(false);
        //     throw new Error(errorMessage);
        // }
        // loadingState(false);
        
    },
    permission: async (noteId, path, permission) => {
        loadingState(true);

        const user = auth.currentUser;
        try{
            const location = "notes"+path;
            const userRef = doc(db, 'users', user.uid);
            const noteRef = doc(userRef, location, noteId);
            await setDoc(
                noteRef,
                {permission},
                { merge: true }
            )
        }
        catch{
            let errorMessage = 'Permission update failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
    deleteNote: async (noteId, path) => {
        loadingState(true);

        const user = auth.currentUser;
        try{
            const location = "notes"+path;
            const userRef = doc(db, 'users', user.uid);
            const noteRef = doc(userRef, location, noteId);
            await deleteDoc(noteRef);
        }
        catch{
            let errorMessage = 'Note deletion failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
    updateTitle: async (noteId, path, title) => {
        loadingState(true);

        const user = auth.currentUser;
        try{
            const location = "notes"+path;
            const userRef = doc(db, 'users', user.uid);
            const noteRef = doc(userRef, location, noteId);
            await setDoc(
                noteRef,
                {title},
                { merge: true }
            )
        }
        catch{
            let errorMessage = 'Title update failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
    inviteUser: async (noteId, path, email) => {
        loadingState(true);

        const user = auth.currentUser;
        try{
            const location = "notes"+path;
            const userRef = doc(db, 'users', user.uid);
            const noteRef = doc(userRef, location, noteId);
            const noteData = (await noteRef.get()).data();
            const invitedUsers = noteData.invitedUsers;
            const invitedUserRef = doc(db, 'users', email);
            const invitedUserData = (await invitedUserRef.get()).data();
            if(invitedUserData === undefined){
                throw new Error('User not found');
            }
            if(invitedUsers.includes(email)){
                throw new Error('User already invited');
            }
            invitedUsers.push(email);
            await setDoc(
                noteRef,
                {invitedUsers},
                { merge: true }
            )
        }
        catch{
            let errorMessage = 'User invitation failed';
            loadingState(false);
            throw new Error(errorMessage);
        }
        loadingState(false);
    },
}


export const showModal = writable(false);
export const userReauthenticated = writable(false);