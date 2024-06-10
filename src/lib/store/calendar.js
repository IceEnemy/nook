import { writable } from 'svelte/store';
import { auth, db, storage } from '$lib/firebase/firebase.js';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, getDoc } from 'firebase/firestore';
import { get, push, ref, set, remove } from 'firebase/database';
import { browser } from '$app/environment';