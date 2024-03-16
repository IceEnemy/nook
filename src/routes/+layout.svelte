<script>
    import '$lib/global.css'
    import { onMount } from 'svelte';
    import { auth, db} from '$lib/firebase/firebase.js';
    import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
    import {authStore} from '$lib/store/store.js';
    import {goto} from '$app/navigation';

    //defines the pages that the user can access if they are not logged in
    const nonAuthRoutes = ['/', '/auth/access', '/auth/forgotPassword']

    onMount(() => {
        console.log('mounting');
        let unsubDoc;
        //onAuthStateChanged is a listener that listens for changes in the user's authentication state
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            const currentPath = window.location.pathname;

            if(!user && !nonAuthRoutes.includes(currentPath)){
                goto('/auth/access');
                // return;
            }

            if(user && (currentPath === '/auth/access' || currentPath === '/')){
                goto('/app/dashboard')
                // return;
            }

            if(!user){
                return;
            }
            //if the user is logged in, then we will fetch the user's data from the firestore and update the authStore
            let dataToSetToStore;
            const docRef = doc(db, 'users', user.uid);
            unsubDoc = onSnapshot(docRef, (docSnap) => {
                if(docSnap.exists()){
                    console.log('Fetching user')
                    const data = docSnap.data();
                    dataToSetToStore = data;
                    authStore.update((curr) => {
                        return {
                            ...curr,
                            user,
                            data: dataToSetToStore,
                            loading: false
                        }
                    })
                }
            })
            // const docSnap = await getDoc(docRef);
            // if(!docSnap.exists()){
            //     console.log('Creating User')
            //     const userRef = doc(db, 'users', user.uid);
            //     dataToSetToStore ={
            //         username: user.displayName,
            //         profilePic: user.photoURL,
            //         email: user.email,
            //         notes: []
            //     }
            //     await setDoc(
            //         userRef,
            //         dataToSetToStore,
            //         { merge: true }
            //     )
            // }
            // else{
            //     console.log('Fetching user')
            //     const data = docSnap.data();
            //     dataToSetToStore = data;
            // }
            // authStore.update((curr) => {
            //     return {
            //         ...curr,
            //         user,
            //         data: dataToSetToStore,
            //         loading: false
            //     }
            // })
        });
        return () => {
            unsubscribe();
            if (unsubDoc) unsubDoc();
        }
    });
</script>

<div class="mainContainer">
    <slot/>
</div>

<style>
    .mainContainer{
        height: 100%;
        width: 100%;
        background: var(--text_high_contrast);
        color: var(--lighter_clr);
        position: relative;
        align-items: center;
        justify-content: center;
        display: flex;
        /* flex-direction: column; */
    }
</style>