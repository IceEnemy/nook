<script>
    import {onMount, onDestroy, afterUpdate} from 'svelte';
    import {page} from '$app/stores';
    import {authHandlers, showModal, updateProfileData, userReauthenticated} from '$lib/store/store';
    import {auth}  from '$lib/firebase/firebase.js';
    import Navbar from '$lib/Navbar.svelte';
    import {fade, scale} from 'svelte/transition';
    import {authStore, uploadProfilePicture} from '$lib/store/store.js';

    let unsubscribe;

    onMount(() => {
        unsubscribe = page.subscribe(() => {
            showModal.set(true);
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    $: username = $authStore.data?.username || 'Loading..';
    $: profilePic = $authStore.data?.profilePic || 'https://via.placeholder.com/150';
    $: phoneNumber = $authStore.data?.phoneNumber || 'Add Phone Number';
    $: DOB = $authStore.data?.DOB || 'Loading..';
    $: email = $authStore.data?.email || 'Loading..';

    let usernameInput;
    let DOBInput;
    let phoneNumberInput;

    // console.log(username, DOB, phoneNumber);

    // let username = '';
    // let profilePic = '';
    let accSelect = 'Security'

    let AccPopup = '';
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

    async function saveChanges(){
        // if(!isChanged) return;
        await updateProfileData(usernameInput, DOBInput, phoneNumberInput);
        dataGot = false;
    }

    function escAcc(event){
        if(event.key === "Escape"){
            closeAcc();
            escAccPopup(event);
        }
    }

    function closeAcc(){
        showModal.set(false);
        dataGot = false;
        closeAccPopup();
    }

    function closeAccPopup(){
        AccPopup = '';
        if(userReauthenticated){
            userReauthenticated = false;
        }
    }

    function escAccPopup(event){
        if(event.key === "Escape"){
            closeAccPopup();
        }
    }


    // function showAcc(){
    //     showModal.set(true);
    //     //set the focus to account settings
    //     // document.querySelector('.blurmodal').focus();
    // }

    $: isChanged = usernameInput !== username || DOBInput !== DOB || phoneNumberInput !== phoneNumber;

    let dataGot = false;

    let accSettingsModal;

    let accPopupModal;

    // $: {
    //     if (showModal && !showModal.previous && accSettingsModal) {
    //         setTimeout(() => {
    //             accSettingsModal.focus();
    //         }, 0);
    //     }
    // }

    // $: {
    //     if(AccPopup !== '' && !AccPopup.previous && accPopupModal){
    //         setTimeout(() => {
    //             accPopupModal.focus();
    //         }, 0);
    //     }
    // }
    

    $: {
        if ($authStore.data.username !== undefined && $authStore.data.DOB !== undefined && !dataGot) {
        usernameInput = $authStore.data.username;
        DOBInput = $authStore.data.DOB;
        phoneNumberInput = $authStore.data.phoneNumber;
        // console.log(usernameInput, DOBInput, phoneNumberInput);
        dataGot = true;
    }}

    
</script>

<div class="appContainer">
    <Navbar/>
    {#if $showModal}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div transition:fade={{ duration: 200 }} class="blurmodal" on:click={closeAcc} on:keydown={(event) => {escAcc(event)}} tabindex="-1" role="dialog" aria-label="Account Settings">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
            <div transition:scale={{ start:0.8, end:1,duration: 200}} class = "accountSettings" on:click|stopPropagation tabindex="0" bind:this={accSettingsModal}>
                <!-- <div class="accountContainer"> -->
                <div class="accButtons">
                    <div class="SettingsTitle">
                        <h1>Settings</h1>
                        <p>Manage your account settings</p>
                    </div>
                    <label class:selected={accSelect === 'Account'}>
                        <input type="radio" bind:group={accSelect} value="Account">
                        <span><i class="fa-solid fa-circle-info"></i> Personal Information</span>
                    </label>
                    <label class:selected={accSelect === 'Security'}>
                        <input type="radio" bind:group={accSelect} value="Security">
                        <span><i class="fa-solid fa-shield-halved"></i>Security</span>
                    </label>
                    <label>
                        <button on:click={authHandlers.logout}></button>
                        <span><i class="fa-solid fa-right-from-bracket"></i>Logout</span>
                    </label>
                </div>
                <div class="accDetails">
                    {#if accSelect === 'Account'}
                        <!-- Content for Account Settings -->
                        <div>
                            <h2>Personal Information</h2>
                            <p>Make changes to your personal information</p>
                        </div>
                        <div>
                            <span class="inputTitle">Profile Picture</span>
                            <div class="profileOverview">
                                <label for="profilePic" class="profilePicLabel">
                                    <img src={profilePic} alt="Your Profile Pict" class="imgContainer">
                                    <div class="imgOverlay">
                                        <i class="fa-solid fa-image"></i>
                                    </div>
                                </label>
                                <input type="file" name="profilePic" id="profilePic" value="" accept="image/*" class="fileInput" on:change={handleFileChange}/>
                                <div>
                                    <p class="inputTitle">{username}</p>
                                    <span>{email}</span>
                                </div>
                            </div>
                        </div>
                        <form>
                            <div class="pInfGrid">
                                <div>
                                    <span class="inputTitle">Username</span>
                                    <label class = "accInputs">
                                        <input type="text" placeholder="Username" bind:value={usernameInput}>
                                    </label>
                                </div>
                                    
                                <div>
                                    <span class="inputTitle">Date of Birth</span>
                                    <label class = "accInputs">
                                        <input type="date" placeholder="Date of Birth" bind:value={DOBInput}>
                                    </label>
                                </div>

                                <div>
                                    <span class="inputTitle">Phone Number</span>
                                    <label class = "accInputs">
                                        <input type="tel" placeholder="Phone Number (Optional)" bind:value={phoneNumberInput}>
                                    </label>
                                </div>
                            </div>
                                <label class="saveButton {!isChanged ? 'disabledButton' : ''}">
                                    <button on:click={saveChanges} disabled={!isChanged}>
                                        <span>Save Changes</span>
                                    </button>
                                </label>
                                
                            </form>
                    {:else if accSelect === 'Security'}
                        <!-- Content for Security -->
                        <div>
                            <h2>Security and Privacy</h2>
                            <p>Make changes to your Security Settings</p>
                        </div>
                        
                        <div class="securityChangeGrid">
                            <p class="inputTitle secTitle">Email</p>
                            <p class = "secContent">{email}</p>
                            <label class="secButton saveButton">
                                <button>Change Email</button>
                            </label>
                            
                        </div>
                        <div class="securityChangeGrid">
                            <p class="inputTitle secTitle">Password</p>
                            <p class = "secContent">Change your password</p>
                            <label class="secButton saveButton">
                                <button>Change Password</button>
                            </label>
                        </div>
                        
                    {/if}
                </div>
                <div class="changePopups" transition:fade={{ duration: 200 }} on:click={closeAcc} on:keydown={(event) => {escAcc(event)}} tabindex="-1" role="dialog" aria-label="Change Popup">
                <!-- Change Email Popup -->
                    <div class="changeInput" transition:scale={{ start:0.8, end:1,duration: 200}} on:click|stopPropagation tabindex="0" bind:this={accPopupModal}>
                        <h2>Change Email</h2>
                        <form class = "popupForm">
                            <div>
                                <span class="inputTitle">Password</span>
                                <label class = "accInputs">
                                    <input type="password" placeholder="Enter current password">
                                    
                                </label>
                            </div>
                            
                            <label class="saveButton">
                                <button>Confirm</button>
                            </label>
                        </form>
                    </div>
                </div>
            </div>
            
        </div>
    {/if}
    <main class="main">
        
        <slot/>
    </main>
</div>


<style>

    .popupForm{
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        align-items: center;
    }

    .changeInput{
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        background: var(--border_interactive_default);
        border-radius: 5px;
    }

    .changePopups{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
        z-index: 1;
    }

    .secTitle{
        grid-area: title;
    }

    .secContent{
        grid-area: content;
    }
    .secButton{
        grid-area: button;
    }

    .securityChangeGrid{
        display: grid;
        grid-template-areas: 
            'title button'
            'content button';
        grid-template-columns: 1fr 1fr;
    }

    .imgOverlay{
        width: 100%;
        height: 100%;
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        background-color: rgba(0,0,0,0.5);
        font-size: 2rem;
        color:var(--app_bg);
        opacity: 0;
    }

    .imgOverlay:hover{
        opacity: 1;
    }

    .profileOverview{
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .inputTitle{
        font-weight: bold;
        /* margin-bottom: 1rem; */
    }    

    button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }
    
    input{
        width: 100%;
        height: 100%;
        border: none;
        background : transparent;
        color: var(--text_high_contrast);
        /* font-size: 1rem;
        font-family:Poppins, sans-serif; */
        padding: 0.5rem;
    }

    form label:focus-within{
        border: 1px solid var(--border_interactive_hover)
    }
    form label:not(.saveButton):hover{
        border: 1px solid var(--border_interactive_hover)
    }
    input:not(.saveButton):focus{
        outline: none;
    }

    .pInfGrid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .accInputs, .saveButton{
        position: relative;
        display: block;
        border: 1px solid var(--border_interactive_default);
        background-color: var(--app_bg);
        border-radius: 5px;
    }

    .saveButton{
        display: flex;
        /* font-size: 2rem; */
        border: none;
        background-color: var(--solid_bg);
        color: white;
        padding: 0.5rem;
        justify-content: center;
        align-items: center;
        justify-self: center;
        cursor: pointer;
        /* margin: 5px; */
        width: 10rem;
    }

    .saveButton button{
        color: var(--text_high_contrast);
    }

    .saveButton:not(.disabledButton):hover{
        background-color: var(--solid_bg_hover);
        color : var(--light_text_high_contrast);
    }

    .saveButton:not(.disabledButton) button:hover{
        color: var(--light_text_high_contrast);
    }

    .disabledButton{
        background-color: var(--subtle_app_bg);
        cursor: default;
    }
    
    .disabledButton button{
        color: var(--light_text_low_contrast);
        cursor: default;
    }

    main{
        padding: 1rem;
        margin-left: 18rem;
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
        /* transition-duration: 300ms; */
        transition-timing-function: ease-in-out;
        display: inline-block;
        background-color: var(--solid_bg);
        padding: 10px 10px 10px 20px;
        margin-left: 2rem;
        /* border-radius: 10px 0px 0px 10px;  */
        font-size: 1rem;
        cursor: pointer;
        /* clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%); */
        /* clip-path: polygon(0 0, 100% 0%, 100% 100%, 0% 100%, 10% 50%); */
    }

    .accButtons label:not(.selected):hover {
        background-color: var(--solid_bg_hover);
        color: var(--light_text_high_contrast);
        margin-left: 0;
    }

    .accButtons label.selected{
        background-color: var(--navbar_bg);
        color: var(--light_text_high_contrast);
        margin-left: 5rem;
        /* transform: translateX(30px); */
        cursor: default;
    }

    .accButtons{
        display: flex;
        flex-direction: column;
        /* gap: 1rem; */
        /* padding: 2rem 0rem 1rem 1rem; */
        padding-top: 2rem;
        background: var(--border_interactive_hover);
        /* background: transparent; */
        /* border-radius: 5px; */
        width: 25%;
        /* width: 16rem; */
        min-width: 18rem;
        height: 100%;
    }

    .profilePicLabel{
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        width: 100px;
        height: 100px;
        border-radius: 100%;
        cursor: pointer;
        box-sizing: border-box;
        position: relative;
    }

    .accDetails{
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 3rem;
        background: var(--border_interactive_default);
        /* border-radius: 5px; */
        width: 75%;
        height: 100%;
        overflow: scroll;
        /* make the scrollbars invisible */
        scrollbar-width: none;
    }

    .SettingsTitle{

        width: 100%;
        height: 8rem;
        padding-left: 2rem;
        /* text-align: left; */
        /* justify-content: left; */

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
        color: var(--text_high_contrast);
        z-index: 2;
        display: flex;
        flex-direction: row;
        /* align-items: center;
        justify-content: center; */
        /* padding: 3rem 3rem; */
        /* background-color: var(--navbar_bg_darker); */
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