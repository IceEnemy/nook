import { writable } from 'svelte/store';
import { auth, db, storage } from '$lib/firebase/firebase.js'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, getDoc } from 'firebase/firestore';
import { get, push, ref, set, remove } from 'firebase/database';


export const updateFlashcardStore = {
    addFlashcard: async (title, parentNoteId) => {
        const user = auth.currentUser;

        let flashcardId;
        let dataToSetToStore;
        let firebaseRef

        const noteRef = doc(db, 'notes', parentNoteId);

        firebaseRef = collection(db, 'flashcards');
        // await updateFlashcardStore.generateQuestions(parentNoteId);
        // questions = await updateFlashcardStore.ExtractText(parentNoteId, user.uid);
        console.log(questions);

        // Open-ended questions or close ended questions

        dataToSetToStore = {
            title,
            parentNoteId,
            owner: user.uid,
            questions: [],
            created: Date.now(),
        }
        const docRef = await addDoc(firebaseRef, dataToSetToStore);
        flashcardId = docRef.id;

        const refData = {
            flashcardId
        }

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(
            userRef,
            { flashcards: arrayUnion(refData) }
        )
    },
    deleteFlashcard: async (flashcardId) => {
        try {
            const user = auth.currentUser;
            const userRef = doc(db, 'users', user.uid);
            const flashcardRef = doc(db, 'flashcards', flashcardId);

            await deleteDoc(flashcardRef);
            await updateDoc(
                userRef,
                { flashcards: arrayRemove({ flashcardId }) }
            )

            console.log(`Flashcard ${flashcardId} deleted successfully`);
        } catch (error) {
            console.error('Error deleting flashcard:', error);
            throw new Error('Failed to delete flashcard');
        }
    },
    updateTitleFlashcard: async (flashcardId, newTitle) => {
        let flashcardRef;
        flashcardRef = doc(db, 'flashcards', flashcardId);
        await updateDoc(
            flashcardRef,
            { title: newTitle }
        )

    },
    generateQuestions: async (noteId) => {
        const user = auth.currentUser;
        const noteRef = doc(db, 'notes', noteId);

        // Fetch the note data
        const noteDoc = await getDoc(noteRef);
        const noteData = noteDoc.data();

        if (!noteData) {
            throw new Error('Note not found');
        }

        const prompt = `Generate flashcards from this note & Include (Type) if its Open-ended question or closed. Format like this [Question] : [Answer] [Type]\n${ExtractText(noteId, uid)}`;
        console.log(prompt);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${meta.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates flashcards.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.7,
                n: 1,
                stop: ["\n"]
            })
        });


        if (!response.ok) {
            const errorDetails = await response.text(); // Get error details
            console.error('Error from OpenAI API:', errorDetails);
            throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        const generatedText = data.choices[0].text;

        console.log('Data:', data);
        console.log('Type of generatedText:', typeof generatedText);
        console.log('Choices:', data.choices[0]);


        // Check if generatedText is a string before calling .trim()
        if (typeof generatedText === 'string') {
            const trimmedText = generatedText.trim();
            const questions = trimmedText.split('\n').map(q => {
                const parts = q.split(':').map(s => {
                    // Check if each part is a string before calling .trim()
                    if (typeof s === 'string') {
                        return s.trim();
                    } else {
                        return s; // Return as is if it's not a string
                    }
                });

                if (parts.length === 2) {
                    const [question, answer] = parts;
                    return { question, answer };
                } else {
                    console.error(`Invalid format for line: ${q}`);
                    return null;
                }
            }).filter(q => q !== null);

            return questions;
        } else {
            console.error('Generated text is not a string');
            return []; 
        }
    }
}