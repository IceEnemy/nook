<script>
    import {onMount, setContext} from 'svelte';
    import {authHandlers} from '$lib/store/store';
    import {auth}  from '$lib/firebase/firebase.js';


    let username = '';
    let profilePic = '';
    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, access displayName here
                username = user.displayName || 'Fallback Username';
                profilePic = user.photoURL || 'https://via.placeholder.com/150';
                // Navigate or perform actions as needed
            } else {
                // User is signed out
                goto('/auth');
            }
        });

        // setContext('userInfo', {username, profilePic})

        return () => unsubscribe();
    });
    
</script>

<h1>Hey, {username} </h1>

<button on:click={authHandlers.logout}>logout</button>

<img src={profilePic} alt="Profile Pic" />
