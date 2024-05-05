<script>
    import {onMount, onDestroy, afterUpdate} from 'svelte';
    import {page} from '$app/stores';
    import {authHandlers, showModal, updateProfileData, userReauthenticated, passwordRequirements} from '$lib/store/store';
    import {auth}  from '$lib/firebase/firebase.js';
    import Navbar from '$lib/Navbar.svelte';
    import {fade, scale} from 'svelte/transition';
    import {authStore, uploadProfilePicture} from '$lib/store/store.js';

    let unsubscribe;

    onMount(() => {
        unsubscribe = page.subscribe(() => {
            showModal.set(true);
            userReauthenticated.set(false);
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
    $: loading = $authStore.loading;

    $: passwordLengthCheck = passwordRequirements.length(newPassword);
    $: passwordUppercaseCheck = passwordRequirements.uppercase(newPassword);
    $: passwordLowercaseCheck = passwordRequirements.lowercase(newPassword);
    $: passwordNumberCheck = passwordRequirements.number(newPassword);
    $: passwordSpecialCheck = passwordRequirements.special(newPassword);

    let usernameInput;
    let DOBInput;
    let phoneNumberInput;

    let password = '';
    let newEmail = '';
    let delEmail = '';
    let newPassword = '';
    let confirmNewPassword = '';
    let errorPopup = '';
    let error = '';


    let isPasswordFocused = false;

    function handlePassFocus(){
        isPasswordFocused = true;
    }

    function handlePassBlur(){
        isPasswordFocused = false;
    }

    // console.log(username, DOB, phoneNumber);

    // let username = '';
    // let profilePic = '';
    let accSelect = 'Account'

    let AccPopup = 'passwordInput';
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

    function openPopup(param){
        if(param == 'email'){
            AccPopup = 'email';
            console.log(param);
        }
        else if(param == 'password'){
            AccPopup = 'password';
            console.log(param);
        }
        else if(param == 'delete'){
            AccPopup = 'delete';
            console.log(param);
        }
    }

    async function confirmReauth(){
        const success = await authHandlers.reauthenticate(password);
        if(success){
            if(AccPopup === 'email'){
                AccPopup = 'emailInput'
            }
            else if(AccPopup === 'password'){
                AccPopup = 'passwordInput';
            }
            else if(AccPopup === 'delete'){
                AccPopup = 'deleteInput';
            }
        }
    }

    async function sendChangeEmail(){
        try{
            await authHandlers.updateEmail(newEmail);
            AccPopup = 'emailSent';
        }
        catch(err){
            errorPopup = err.message;
        }
    }

    async function changePassword(){
        if(newPassword !== confirmNewPassword){
            errorPopup = 'Passwords do not match';
            return;
        }
        try{
            await authHandlers.updatePassword(newPassword);
            AccPopup = 'passwordChanged';
        }
        catch(err){
            errorPopup = err.message;
        }
        
    }

    async function deleteAccount(){
        if(delEmail !== email){
            errorPopup = 'Email does not match';
            return;
        }
        try{
            await authHandlers.deleteAccount();
        }
        catch(err){
            errorPopup = err.message;
        }
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
        error = '';
        closeAccPopup();
    }

    function closeAccPopup(){
        AccPopup = '';
        password = '';
        newEmail = '';
        delEmail = '';
        newPassword = '';
        confirmNewPassword = '';
        errorPopup = '';
        if(userReauthenticated){
            userReauthenticated.set(false);
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

    $: isChanged = usernameInput !== username || DOBInput !== DOB || (phoneNumberInput !== phoneNumber && phoneNumberInput !== '' && phoneNumber !== '');

    let dataGot = false;

    let accSettingsModal;

    let accPopupModal;

    $: {
        if (showModal && !showModal.previous && accSettingsModal) {
            setTimeout(() => {
                accSettingsModal.focus();
            }, 0);
        }
    }

    $: {
        if(AccPopup !== '' && !AccPopup.previous && accPopupModal){
            setTimeout(() => {
                accPopupModal.focus();
            }, 0);
        }
    }
    

    $: {
        if ($authStore.data.username !== undefined && $authStore.data.DOB !== undefined && !dataGot) {
        usernameInput = $authStore.data.username;
        DOBInput = $authStore.data.DOB;
        phoneNumberInput = $authStore.data.phoneNumber;
        // console.log(usernameInput, DOBInput, phoneNumberInput);
        dataGot = true;
    }}

    
</script>

{#if !loading}
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
                        <span><i class="fa-solid fa-shield-halved"></i> Security</span>
                    </label>
                    <label>
                        <button on:click={authHandlers.logout}></button>
                        <span class="error"><i class="fa-solid fa-right-from-bracket error"></i> Logout</span>
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
                                <button on:click={() => openPopup('email')}>Change Email</button>
                            </label>
                            
                        </div>
                        <div class="securityChangeGrid">
                            <p class="inputTitle secTitle">Password</p>
                            <p class = "secContent">Change your password</p>
                            <label class="secButton saveButton">
                                <button on:click={() =>openPopup('password')}>Change Password</button>
                            </label>
                        </div>
                        <div class="securityChangeGrid delAcc">
                            <p class="inputTitle secTitle">Delete Account</p>
                            <p class = "secContent">Delete your account</p>
                            <label class="secButton saveButton">
                                <button on:click={() =>openPopup('delete')}>Delete Account</button>
                            </label>
                        </div>
                        
                    {/if}
                    {#if error !== ''}
                        <p class="error">{error}</p>
                    {/if}
                </div>
                {#if AccPopup !== ''}
                <div class="changePopups" transition:fade={{ duration: 200 }} on:click={closeAccPopup} on:keydown={(event) => {escAccPopup(event)}} tabindex="-1" role="dialog" aria-label="Change Popup">
                <!-- Change Email Popup -->
                    <div class="changeInput" transition:scale={{ start:0.8, end:1,duration: 200}} on:click|stopPropagation tabindex="0" bind:this={accPopupModal}>
                        {#if AccPopup === 'email' || AccPopup === 'password' || AccPopup === 'delete'}
                            <h2>Enter your password</h2>
                            <form class = "popupForm">
                                <div class='popupDiv'>
                                    <!-- <span class="inputTitle">Password</span> -->
                                    <label class = "accInputs">
                                        <input type="password" placeholder="Type in your password!" bind:value={password}>
                                        
                                    </label>
                                </div>
                            
                                <label class="saveButton">
                                    <button on:click={confirmReauth}>Confirm</button>
                                </label>
                                
                            </form>
                        {:else if AccPopup === 'emailInput'}
                            <h2>Change Email</h2>
                            <form class = "popupForm">
                                <div class='popupDiv'>
                                    <span class="inputTitle">New Email</span>
                                    <label class = "accInputs">
                                        <input type="email" placeholder="Enter new email" bind:value={newEmail}>
                                        
                                    </label>
                                </div>
                            
                                <label class="saveButton">
                                    <button on:click={sendChangeEmail}>Send email</button>
                                </label>
                                
                            </form>

                        {:else if AccPopup === 'passwordInput'}
                            <h2>Change Password</h2>
                            <form class = "popupForm">
                                <div class='popupDiv'>
                                    <span class="inputTitle">New Password</span>
                                    <label class = "accInputs">
                                        <input type="password" placeholder="Enter new password" bind:value={newPassword} on:focus={handlePassFocus} on:blur={handlePassBlur}>
                                        
                                    </label>
                                </div>
                                <div class='popupDiv'>
                                    <span class="inputTitle">Confirm New Password</span>
                                    <label class = "accInputs">
                                        <input type="password" placeholder="Confirm new password" bind:value={confirmNewPassword}>
                                    </label>
                                </div>
                            
                                <label class="saveButton">
                                    <button on:click={changePassword}>Change password</button>
                                </label>
                                
                            </form>
                            {#if isPasswordFocused}
                                <div class="reqPopup">
                                    <h2>Password Requirements</h2>
                                    <div class="reqCheck">
                                        <div class="reqCheckmark">
                                            {#if passwordLengthCheck}
                                                <i class="fa-solid fa-check"></i>
                                            {:else}
                                                <i class="fa-solid fa-xmark"></i>
                                            {/if}
                                        </div>
                                        <p class={passwordLengthCheck ? 'reqSatisfied' : 'reqNotMet'}>8 characters long</p>
                                    </div>
                                    <div class="reqCheck">
                                        <div class="reqCheckmark">
                                            {#if passwordUppercaseCheck}
                                                <i class="fa-solid fa-check"></i>
                                            {:else}
                                                <i class="fa-solid fa-xmark"></i>
                                            {/if}
                                        </div>
                                        <p class = {passwordUppercaseCheck ? 'reqSatisfied' : 'reqNotMet'}>Have at least 1 uppercase character</p>
                                    </div>
                                    <div class="reqCheck">
                                        <div class="reqCheckmark">
                                            {#if passwordLowercaseCheck}
                                                <i class="fa-solid fa-check"></i>
                                            {:else}
                                                <i class="fa-solid fa-xmark"></i>
                                            {/if}
                                        </div>
                                        <p class = {passwordLowercaseCheck ? 'reqSatisfied' : 'reqNotMet'}>Have at least 1 lowercase character</p>
                                    </div>
                                    <div class="reqCheck">
                                        <div class="reqCheckmark">
                                            {#if passwordNumberCheck}
                                                <i class="fa-solid fa-check"></i>
                                            {:else}
                                                <i class="fa-solid fa-xmark"></i>
                                            {/if}
                                        </div>
                                        <p class = {passwordNumberCheck ? 'reqSatisfied' : 'reqNotMet'}>Have at least 1 number</p>
                                    </div>
                                    <div class="reqCheck">
                                        <div class="reqCheckmark">
                                            {#if passwordSpecialCheck}
                                                <i class="fa-solid fa-check"></i>
                                            {:else}
                                                <i class="fa-solid fa-xmark"></i>
                                            {/if}
                                        </div>
                                        <p class = {passwordSpecialCheck ? 'reqSatisfied' : 'reqNotMet'}>Have at least 1 special character</p>
                                    </div>
                                </div>
                            {/if}
                            
                        {:else if AccPopup === 'deleteInput'}
                            <h2>Delete Account</h2>
                            <form class = "popupForm">
                                <div class='popupDiv'>
                                    <span>Are you sure you want to delete your account? Type your email to proceed!</span>
                                    <label class = "accInputs">
                                        <input type="email" placeholder="Enter your email" bind:value={delEmail}>
                                    </label>
                                </div>
                                <div class = 'doublePopupButtons'>
                                    <label class="saveButton warnButton">
                                        <button on:click={deleteAccount}>Delete Account</button>
                                    </label>  
                                    <label class="saveButton">
                                        <button on:click={closeAccPopup}>Cancel</button>
                                    </label>  
                                </div>
                                
                            </form>

                        {:else if AccPopup === 'emailSent'}
                            <span class="ion--checkmark-outline big-icon checkmark"></span>

                            <h2>Email Sent</h2>
                            <span>An email has been sent to your new email address. Please verify your email address to complete the change!</span>
                            <label class="saveButton">
                                <button on:click={closeAccPopup}>Close</button>
                            </label>  

                        {:else if AccPopup === 'passwordChanged'}
                            <span class="ion--checkmark-outline big-icon checkmark"></span>
                            <h2>Password Changed</h2>
                            <span>Your password has been changed successfully!</span>
                            <label class="saveButton">
                                <button on:click={closeAccPopup}>Close</button>
                            </label> 
                        {/if}

                        {#if errorPopup !== ''}
                            <p class="error">{errorPopup}</p>
                        {/if}
                    </div>
                </div>
                {/if}
            </div>
            
        </div>
    {/if}
    <main class="main">
        
        <slot/>
    </main>
</div>
{/if}


<style>
    .reqPopup{
        transform: translate(130%, -15%);
    }
    .delAcc{
        margin-top: auto;
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

    .pInfGrid{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    main{
        padding: 3rem 3rem 0 3rem;
        margin-left: 18rem;
        width: calc(100% - 18rem);
        background-color: var(--seasalt);
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
        background-color: var(--seasalt);
        padding: 10px 10px 10px 20px;
        margin-left: 2rem;
        border-radius: 10px 0px 0px 10px; 
        font-size: 1rem;
        cursor: pointer;

        /* clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%); */
        /* clip-path: polygon(0 0, 100% 0%, 100% 100%, 0% 100%, 10% 50%); */
    }

    .accButtons label:not(.selected):hover {
        background-color: var(--dim_linen);
        /* color: var(--light_text_high_contrast); */
        margin-left: 0;
    }

    .accButtons label.selected{
        background-color: var(--almond);
        /* color: var(--light_text_high_contrast); */
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
        background: var(--seasalt);
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
        background: var(--default_white);
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
        z-index: 90000;
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
        border-radius: 30px;
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