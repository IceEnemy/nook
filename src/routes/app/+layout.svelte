
<script>
    import {onMount, setContext} from 'svelte';
    // import {authHandlers} from '$lib/store/store';
    import {auth}  from '$lib/firebase/firebase.js';
    import Navbar from '$lib/Navbar.svelte';


    // let username = '';
    let profilePic = '';
    onMount(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, access displayName here
                // username = user.displayName || 'Fallback Username';
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

<div class="appContainer">
    <Navbar/>
    <main class="main">
        <slot/>
    </main>
</div>


<style>
    main{
        padding: 1rem;
        margin-left: 18rem;
        /* fill the empty right space */
        width: calc(100% - 18rem);
    }

    .appContainer{
        display: flex;
        height: 100%;
        width:100%;
        position: relative;
        justify-content: left;
        align-items:normal;
        background-color: var(--light_clr);
    }
</style>