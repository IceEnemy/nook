<script>
    import '$lib/global.css'
    import '$lib/iconify.css'
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
            //if the user is logged in, then we will fetch the user's data from the firestore and update the authStore
            if(!user){
                return;
            }
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
        });

        const unsubToken = auth.onIdTokenChanged(async (user) => {
            const currentPath = window.location.pathname;

            console.log('Checking token');

            if(!user && !nonAuthRoutes.includes(currentPath)){
                goto('/auth/access');
                // return;
            }

            else if(user && (currentPath === '/auth/access' || currentPath === '/')){
                goto('/app/dashboard')
                // return;
            }
        })
        return () => {
            unsubToken();
            unsubscribe();
            if (unsubDoc) unsubDoc();
        }
    });
    // function to check when auth email is the same as firestore email
    $: authStore.subscribe($authStore => {
    // console.log('Checking email');
        if (auth.currentUser && $authStore.data && $authStore.data.email && auth.currentUser.email) {
            if (auth.currentUser.email !== $authStore.data.email) {
                console.log('Updating email in Firestore');
                setDoc(doc(db, 'users', auth.currentUser.uid), {
                    email: auth.currentUser.email
                }, { merge: true })
                .catch(error => console.error("Failed to update Firestore:", error));
            }
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
        background: var(--seasalt);
        color: var(--van_dyke);
        position: relative;
        align-items: center;
        justify-content: center;
        display: flex;
        /* flex-direction: column; */
    }
</style>