import { writable } from 'svelte/store';
import { auth, db, storage } from '$lib/firebase/firebase.js';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, getDoc } from 'firebase/firestore';
import { get, push, ref, set, remove } from 'firebase/database';
import { browser } from '$app/environment';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const updateFlashcardStore = {
    addFlashcard: async (title, parentNoteId, text) => {
        const user = auth.currentUser;

        let flashcardId;
        let dataToSetToStore;
        let firebaseRef;

        const noteRef = doc(db, 'notes', parentNoteId);

        firebaseRef = collection(db, 'flashcards');

        // Call generateQuestions to get the questions
        const questions = await updateFlashcardStore.generateQuestions(text);

        dataToSetToStore = {
            title,
            parentNoteId,
            owner: user.uid,
            questions,
            created: Date.now(),
        };
        const docRef = await addDoc(firebaseRef, dataToSetToStore);
        flashcardId = docRef.id;

        const refData = {
            flashcardId
        };

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(
            userRef,
            { flashcards: arrayUnion(refData) }
        );

        // once done navigate to the flashcard
        console.log('Flashcard added successfully');
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
            );

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
        );
    },
    generateQuestions: async (text) => {
        const prompt = `Generate flashcard questions and their answers from the note context given below. Also, include if the question is open-ended (short answer) or not. The response should be in JSON format like this:
        [
            {
                "question": "###",
                "answer": "###",
                "open": true or false
            }
        ]
        Note context: "${text}"`;

        console.log(prompt);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that generates flashcards.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 1000,
                temperature: 0.7,
                n: 1
            })
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Get error details
            console.error('Error from OpenAI API:', errorDetails);
            throw new Error('Failed to generate questions');
        }

        const data = await response.json();
        console.log('Generated questions:', data);

        // Process the generated questions and return them
        let generatedQuestionsText = data.choices[0].message.content.trim();
        console.log('Raw generated questions content:', generatedQuestionsText);

        // Remove code block notation if present
        if (generatedQuestionsText.startsWith('```json')) {
            generatedQuestionsText = generatedQuestionsText.substring(7, generatedQuestionsText.length - 3).trim();
        }

        // Sanitize the content to ensure it is valid JSON
        generatedQuestionsText = generatedQuestionsText.replace(/\n/g, ' ').replace(/\r/g, ' ');

        try {
            const generatedQuestions = JSON.parse(generatedQuestionsText);
            console.log('Generated questions content:', generatedQuestions);
            return generatedQuestions;
        } catch (error) {
            console.error('Error parsing generated questions JSON:', error);
            console.log('Sanitized generated questions content:', generatedQuestionsText);
            throw new Error('Failed to parse generated questions');
        }
    }
};
