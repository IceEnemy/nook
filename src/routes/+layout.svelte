<script>
    import '$lib/global.css'
    import '$lib/iconify.css'
    import { onMount } from 'svelte';
    import { auth, db } from '$lib/firebase/firebase.js';
    import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
    import { authStore } from '$lib/store/store.js';
    import { goto } from '$app/navigation';

    // Defines the pages that the user can access if they are not logged in
    const nonAuthRoutes = ['/', '/auth/access', '/auth/forgotPassword'];

    onMount(() => {
        console.log('mounting');
        let unsubDoc;

        // onAuthStateChanged is a listener that listens for changes in the user's authentication state
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User is logged in:', user);
                const docRef = doc(db, 'users', user.uid);
                unsubDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        console.log('Fetching user data');
                        const data = docSnap.data();
                        authStore.update((curr) => ({
                            ...curr,
                            user,
                            data,
                            loading: false
                        }));
                    }
                });
            } else {
                console.log('No user logged in');
            }
        });

        const unsubToken = auth.onIdTokenChanged(async (user) => {
            const currentPath = window.location.pathname;
            console.log('Checking token for path:', currentPath);

            if (!user && !nonAuthRoutes.includes(currentPath)) {
                console.log('User not logged in, redirecting to /auth/access');
                goto('/auth/access');
            } else if (user && (currentPath === '/auth/access' || currentPath === '/')) {
                console.log('User logged in, redirecting to /app/dashboard');
                goto('/app/dashboard');
            }
        });

        return () => {
            unsubToken();
            unsubscribe();
            if (unsubDoc) unsubDoc();
        };
    });

    // Function to check when auth email is the same as Firestore email
    $: authStore.subscribe($authStore => {
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
        background: var(--default_white);
        color: var(--van_dyke);
        position: relative;
        align-items: center;
        justify-content: center;
        display: flex;
        /* flex-direction: column; */
    }
</style>