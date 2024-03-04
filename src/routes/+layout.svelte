<script>
    import '$lib/global.css'
    import { onMount } from 'svelte';
    import { auth, db} from '$lib/firebase/firebase.js';
    import { doc, getDoc, setDoc } from 'firebase/firestore';
    import {authStore} from '$lib/store/store.js';
    import {goto} from '$app/navigation';

    const nonAuthRoutes = ['/']

    onMount(() => {
        console.log('mounting');
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            const currentPath = window.location.pathname;

            if(!user && !nonAuthRoutes.includes(currentPath)){
                goto('/');
                return;
            }

            if(user && currentPath === '/'){
                window.location.href = '/dashboard';
                return;
            }

            if(!user){
                return;
            }

            let dataToSetToStore;
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if(!docSnap.exists()){
                console.log('Creating User')
                const userRef = doc(db, 'users', user.uid);
                dataToSetToStore ={
                    email: user.email,
                    notes: []
                }
                await setDoc(
                    userRef,
                    dataToSetToStore,
                    { merge: true }
                )
            }
            else{
                console.log('Fetching user')
                const data = docSnap.data();
                dataToSetToStore = data;
            }
            authStore.update((curr) => {
                return {
                    ...curr,
                    user,
                    data: dataToSetToStore,
                    loading: false
                }
            })
        });
        return unsubscribe;
    });
</script>

<div class="mainContainer">
    <slot/>
</div>

<style>
    .mainContainer{
        height: 100%;
        background: linear-gradient(to right, #000428, #000046);
        color: white;
        position: relative;
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }
</style>