<script>
    import {onMount, setContext, onDestroy} from 'svelte';
    import {page} from '$app/stores';
    import {authHandlers, showModal} from '$lib/store/store';
    import {auth}  from '$lib/firebase/firebase.js';
    import Navbar from '$lib/Navbar.svelte';
    import {fade, scale} from 'svelte/transition';
    import {authStore, uploadProfilePicture} from '$lib/store/store.js';

    let unsubscribe;

    onMount(() => {
        unsubscribe = page.subscribe(() => {
            showModal.set(false);
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    $: username = $authStore.data?.username || 'Loading..';
    $: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';
    // let username = '';
    // let profilePic = '';
    let accSelect = 'Account'
    // onMount(() => {
    //     const unsubscribe = authStore.subscribe((val) => {
    //         username = val.data.username || 'Loading..';
    //         profilePic = val.data.profilePic || 'https://via.placeholder.com/150';
    //     })

    //     return () => unsubscribe();
    // });
    async function handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Upload file to firebase storage and update user's profile
        await uploadProfilePicture(file);
    }

    function escAcc(event){
        if(event.key === "Escape"){
            showModal.set(false);
        }
    }

    function closeAcc(){
        showModal.set(false);
    }
    
</script>

<div class="appContainer">
    <Navbar/>
    <main class="main">
        {#if $showModal}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <div transition:fade={{ duration: 200 }} class="blurmodal" on:click={closeAcc} on:keydown={(event) => {escAcc(event)}} tabindex="-1" role="dialog" aria-label="Account Settings">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div transition:scale={{ start:0.8, end:1,duration: 200}} class = "accountSettings" on:click|stopPropagation>
                    <div class="SettingsTitle">
                        <h1>Settings</h1>
                        <p>Manage your account settings</p>
                    </div>
                    <div class="accountContainer">
                        <div class="accButtons">
                            <label class:selected={accSelect === 'Account'}>
                                <input type="radio" bind:group={accSelect} value="Account">
                                <span>Personal Information</span>
                            </label>
                            <label class:selected={accSelect === 'Security'}>
                                <input type="radio" bind:group={accSelect} value="Security">
                                <span>Security</span>
                            </label>
                            <label>
                                <button on:click={authHandlers.logout}></button>
                                <span>Logout</span>
                            </label>
                        </div>
                        <div class="verticalLine">

                        </div>
                        <div class="accDetails">
                            {#if accSelect === 'Account'}
                                <!-- Content for Account Settings -->
                                <p>Here are your account settings...</p>
                                <div>
                                    <label for="profilePic">
                                        <img src={profilePic} alt="Your Profile Pict" class="imgContainer">
                                    </label>
                                    <input type="file" name="profilePic" id="profilePic" value="" accept="image/*" class="fileInput" on:change={handleFileChange}/>
                                    
                                    <!-- <h1>{username}</h1> -->
                                    <!-- input type must be just by clicking the img above, and remove button -->
                                </div>
                                
                            {:else if accSelect === 'Security'}
                                <!-- Content for Security -->
                                <p>Security options...</p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        <slot/>
    </main>
</div>


<style>
    main{
        padding: 1rem;
        margin-left: 18rem;
        /* fill the empty right space */
        width: calc(100% - 18rem);
        position:relative;
    }

    .imgContainer{
        width: 100px;
        height: 100px;
        /* border-radius: 50%; */
        object-fit: cover;
        /* box-sizing: border-box; */
    }

    input[type="radio"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }

    .accButtons label {
        display: inline-block;
        background-color: var(--light_clr);
        padding: 10px;
        margin: 5px;
        border-radius: 5px;
        cursor: pointer;
        /* Additional styling as needed */
    }

    .accButtons label:hover {
        background-color: var(--prim_clr);
        color: var(--lighter_clr);
        /* Additional styling as needed */
    }

    .accDetails label{
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        width: 100px; /* Match the imgContainer's size */
        height: 100px; /* Match the imgContainer's size */
        border-radius: 100%; /* Inherit border-radius for a circular shape */
        cursor: pointer;
    /* Ensure box sizing includes padding and border */
        box-sizing: border-box;
    /* Optional: adjust positioning if necessary */
        position: relative;
    }

    button {
        background: none; /* Removes the default background */
        border: none; /* Removes the default border */
        padding: 0; /* Removes the default padding */
        cursor: pointer;
    }
    

    /* Style when radio button is checked */
    label.selected{
        background-color: var(--prim_clr);
        color: var(--lighter_clr);
        /* Other styles to indicate selection */
    }

    .accButtons{
        display: flex;
        flex-direction: column;
        /* gap: 1rem; */
        padding: 1rem;
        background: var(--light_clr);
        border-radius: 5px;
        width: 25%;
        min-width: 15rem;
        height: 100%;
    }

    .accDetails{
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background: var(--light_clr);
        border-radius: 5px;
        width: 75%;
        height: 100%;
        overflow: scroll;
        /* make the scrollbars invisible */
        scrollbar-width: none;
    }

    .accountContainer{
        display: flex;
        flex-direction: row;
        gap: 1rem;
        /* padding: 1rem; */
        background: var(--light_clr);
        border-radius: 5px;
        width: 100%;
        height: 100%;
        /* overflow: scroll; */
    }

    .SettingsTitle{

        width: 100%;
        height: 8rem;

        /* background: var(--prim_clr); */
    }

    .blurmodal{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
        z-index: 1;
    }

    .accountSettings{
        color: var(--prim_clr);
        z-index: 2;
        display: flex;
        flex-direction: column;
        /* align-items: center;
        justify-content: center; */
        padding: 3rem 3rem;
        background: var(--light_clr);
        width: 80rem;
        max-width: 80%;
        max-height: 80%;
        height: 40rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 5px;
        overflow: hidden;
    }

    .appContainer{
        display: flex;
        height: 100%;
        width:100%;
        position: relative;
        justify-content: left;
        align-items:normal;
        background-color: var(--lighter_clr);
    }

    .fileInput{
        display: none;
        cursor: pointer;
    }
    .fileInput:hover{
        cursor: pointer;
    }
</style>