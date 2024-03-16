<script>
    import '$lib/global.css'
	import { authHandlers } from './store/store';
    import { slide, fade } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { flip } from 'svelte/animate';
    import NookLogo from '$lib/assets/NookLogo.svelte'
    

    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let DOB = '';
    let phoneNumber = '';
    let error = false;
    let errormsg = '';
    //second step is a check of whether or not the user is on the second step of the registration process
    let secondStep = false;
    //slid is a check of whether or not the user has slid to the second step of the registration process
    let slid = false;
    //register is a check of whether or not the user is registering or signing in
    let register = false;
    //authenticating is a check of whether or not the user is currently authenticating (more like loading)
    let authenticating = false;

    let isPasswordFocused = false;

    function handlePassFocus(){
        if(register){
            isPasswordFocused = true;
        }
    }

    function handlePassBlur(){
        if(register){
            isPasswordFocused = false;
        }
    }

    function passwordRequirements(password){
        // password needs to be atleast 8 letters long, contain atleast 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])[A-Za-z\d\S]{8,}$/;
        return passwordRegex.test(password);
    }

    function passwordLength(password){
        return password.length >= 8;
    }

    function passwordUppercase(password){
        const passwordRegex = /^(?=.*[A-Z])/;
        return passwordRegex.test(password);
    }

    function passwordLowercase(password){
        const passwordRegex = /^(?=.*[a-z])/;
        return passwordRegex.test(password);
    }

    function passwordNumber(password){
        const passwordRegex = /^(?=.*\d)/;
        return passwordRegex.test(password);
    }

    function passwordSpecial(password){
        const passwordRegex = /^(?=.*[^A-Za-z\d\s])/;
        return passwordRegex.test(password);
    }

    $: passwordLengthCheck = passwordLength(password);
    $: passwordUppercaseCheck = passwordUppercase(password);
    $: passwordLowercaseCheck = passwordLowercase(password);
    $: passwordNumberCheck = passwordNumber(password);
    $: passwordSpecialCheck = passwordSpecial(password);

    async function handleAuthenticate(){

        //if the user is currently loading, button will not work
        if(authenticating){
            return;
        }
    
        //if the button is 'Next', the user will be directed to the second step of the registration process
        const emailRegex = /^(?=[a-zA-Z0-9@.]{6,254}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            error = true;
            errormsg = "Please enter a valid email address.";
            return;
        }

        if(!password){
            error = true;
            errormsg = "Please enter a password.";
            return;
        }

        if(register){
            if(!passwordRequirements(password)){
                error = true;
                errormsg = "Password does not meet the requirements.";
                return;
            }
            else if(password !== confirmPassword){
                error = true;
                errormsg = "Passwords do not match.";
                return;
            }
            else if(secondStep){
                if(!username){
                    error = true;
                    errormsg = "Please enter a username.";
                    return;
                }
                else if(!DOB){
                    error = true;
                    errormsg = "Please enter your date of birth.";
                    return;
                }
            }
            
        }


        if(register && !slid){
            secondStep = true;
            slid = true;
            return;
        }

        error = false;
        
        //Error function, might need to be updated to allow for more specific error messages

        //set the loading state to true
        authenticating = true;

        try{
            if(!register){
                await authHandlers.login(email, password);
            }
            else{
                if(!passwordRequirements(password)){
                    error = true;
                    authenticating = false;
                    return;
                }

                await authHandlers.signup(email, password, username, DOB, phoneNumber);

            }
        }
        catch(err){
            console.log("Authenticating Error: ", err);
            error = true;
            errormsg = err.message;
        }
        finally{
            authenticating = false;
        }
        
    }

    //to determine the swipe direction of the animation of the auth form
    $: swipeClass = slid ? 'swipeLeft' : 'swipeRight';

    //to unload the secondStep after the animation has finished
    function handleSecondStepRemove(){
        if(!slid){
            secondStep = false;
        }
    }
    //opens the forgot password page in a new window
    function openForgotPassword() {
        const url = '/auth/forgotPassword';
        window.open(url, '_blank');
    }
</script>
<div class="authContainer">
    <div class="logoDesc">
        <NookLogo color='var(--text_high_contrast)' width=160/>
        <h1>{register? 'SIGN UP' : 'SIGN IN'}</h1>
        {#if error}
            <p transition:slide={{duration: 500, easing: cubicOut}} class="error">{errormsg}</p>
        {/if} 
    </div>
    
    <form>
        <div class="swipeInputs">
            <div class="inputs {swipeClass}">
                <!-- {#if register}
                <label>
                    <p class={username ? 'above' : 'center'}>Username</p>
                    <input type="text" placeholder="Username" bind:value={username}>
                </label>
                {/if} -->
                <label>
                    <p class={email ? 'above' : 'center'}>Email</p>
                    <input type="email" placeholder="Email" bind:value={email}>
                </label>
                <label>
                    <p class={password ? 'above' : 'center'}>Password</p>
                    <input type="password" placeholder="Password" bind:value={password} on:focus={handlePassFocus} on:blur={handlePassBlur}>
                </label>
                {#if register}
                <label transition:slide={{duration: 500, easing: cubicOut}}>
                    <p class={confirmPassword ? 'above' : 'center'}>Confirm Pssword</p>
                    <input type="password" placeholder="Confirm Password" bind:value={confirmPassword}>
                </label>
                {/if}
            </div>
            {#if secondStep}
                <div class="inputs {swipeClass}" on:animationend={handleSecondStepRemove}>
                    <label>
                        <p class={username ? 'above' : 'center'}>Username</p>
                        <input type="text" placeholder="Username" bind:value={username}>
                    </label>
                    <!--date of birth and phone number-->
                    <label>
                        <p class='above'>Date of Birth</p>
                        <input type="date" placeholder="Date of Birth" bind:value={DOB}>
                    </label>
                    <label>
                        <p class={phoneNumber ? 'above' : 'center'}>Phone Number</p>
                        <input type="tel" placeholder="Phone Number (Optional)" bind:value={phoneNumber}>
                    </label>
                </div>
            {/if}
        </div>
        
        <div class='checks'>
            <!--remember me checkbox-->
            {#if !register || slid}
                <div class="rmbMeContainer" transition:fade ={{duration:500, easing:cubicOut}}>
                    <input type="checkbox" />
                    {#if register}
                        <span>Agree to <button class="clickableText">Terms of Service</button></span>
                    {:else}
                        <span>Remember Me</span>
                    {/if}
                </div>
            {/if}

            {#if !register}
                <button type="button" class='clickableText' transition:fade ={{duration:500, easing:cubicOut}} on:click={openForgotPassword}>Forgot Password?</button>
            {/if}
        </div>
        
        <button type="button" on:click={handleAuthenticate}>
            {#if authenticating}
                <i class="fa-solid fa-spinner spin"></i>
            {:else}
                {#if register && !slid}
                Next
                {:else if register}
                Sign Up
                {:else}
                Sign In
                {/if}
            {/if}
        </button>
        {#if register && !slid}
            <span class='switchText'>Already have an account? <button type="button" class='clickableText' on:click={() => {register = false; error=false}}>Sign In</button></span>
        {:else if register}
            <span class='switchText'>Wrong Credentials? <button type="button" class='clickableText' on:click={() => {slid = false; error=false}}>Go Back</button></span>
        {:else}
            <span class='switchText'>Don't have an account? <button type="button" class='clickableText' on:click={() => {register = true; error=false}}>Sign Up</button></span>
        {/if}
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


</div>

<div class="authImage">

</div>
<style>
    .reqSatisfied, .reqNotMet{
        padding: 2px;
        border-radius: 5px;
        /* display: grid; */
        place-items: center;
    }
    .reqSatisfied{
        background-color: var(--navbar_contrast_text_transparent);
    }
    .reqNotMet{
        background-color: var(--error_transparent);
        /* color: var(--app_bg); */
    }
    .fa-check{
        color: var(--navbar_contrast_text)
    }
    .fa-xmark{
        color: var(--error);
    }
    .reqCheck{
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    /* .reqCheckmark{
        border: 1px solid var(--text_high_contrast);
        border-radius: 100%;
    } */
    .reqPopup{
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1rem;
        /* position: relative; */
        /* left: 50%; */
        transform: translate(115%, 105%);
        width: 350px;
        height: 250px;
        border-radius: 10px;
        box-shadow: 0 0 5px 3px rgba(0,0,0,0.1);
        background-color: var(--app_bg);
        z-index: 10;
        padding: 1rem;
    }
    .reqPopup::after {
        content: '';
        position: absolute;
        transform: rotate(45deg);
        left: -10px;
        top: 43.5%;
        width: 20px; /* Tail width */
        height: 20px; /* Tail height */
        background-color: var(--app_bg); /* Tail color, match the reqPopup's background */
        box-shadow: -3px 3px 5px 0 rgba(0,0,0,0.1);
        z-index: 9;
    }
    .rmbMeContainer{
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
        color: var(--text_low_contrast);
    }
    .rmbMeContainer input[type="checkbox"] {
        accent-color: var(--text_low_contrast);
    }
    .swipeInputs{
        display: flex;
        /* flex-wrap:hidden; */
        overflow-x: hidden;
        overflow-y: visible;
        position:relative;

        width: 400px;
        max-width: 100%;
        gap: 1rem;
        padding-top: 1rem;
    }

    .logoDesc{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin: 4rem 0 2rem 0;
    }

    .checks{
        display: flex;
        height: 3rem;
        align-items: center;
        justify-content: space-between;
    }
    .switchText, .clickableText {
        display: inline; 
        /* margin-top: 1rem; */
    }
    .switchText{
        text-align: center;
        margin-top: 1rem;
        color: var(--text_low_contrast);
    }
    .clickableText {
        background: none;
        border: none;
        color: var(--text_high_contrast);
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        font-size: inherit;
    }
    .inputs{
        display: flex;
        flex-direction: column;
        flex:0 0 100%;
        gap: 2rem;
        width: 400px;
        max-width: 100%;
        margin: 0 auto;
    }

    .authContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        /* justify-content: center; */
        padding: 24px;
        background:var(--app_bg);
        width: 40rem;
        /* max-width: 40rem; */
        height: 45rem;
        
        /* margin: 0 auto; */
        /* flex: 1; */
        color: var(--text_high_contrast);
    }
    .authImage{
        background:var(--subtle_app_bg);
        width: 40rem;
        height: 45rem;
    }
    form{
        display: flex;
        flex-direction: column;
        /* gap: 2rem; */
        /* width: 400px; */
        /* max-width: 100%; */
        margin: 0 auto;
    }
    form label {
        position: relative;
        border: 1px solid var(--border_interactive_default);
        border-radius: 5px;
        /* background-color: white; */
    }

    form label:focus-within{
        border: 1px solid var(--border_interactive_hover)
    }
    form label:hover{
        border: 1px solid var(--border_interactive_hover)
    }

    form input{
        width: 100%;
        border: none;
        background : transparent;
        color: var(--text_high_contrast);
        font-size: 1rem;
        padding: 1rem;
    }

    form input::placeholder{
        color: var(--border_interactive_default);
    }

    form input:focus{
        outline: none;
    }

    h1 {
        text-align: center;
        font-size: 4rem;
    }
    h2{
        text-align: center;
        font-size: 1.5rem;
    }
    form button{
        background: var(--text_high_contrast);
        color: var(--app_bg);
        font-size: 1rem;
        border:none;
        padding: 1rem;
        border-radius: 5px;
        cursor: pointer;
        display: grid;
        place-items: center;
    }

    /* form button:hover{
        background: blue;
    } */
    .above, .center {
        position: absolute;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--text_high_contrast);
        border-radius: 4px;
        padding: 0 6px;
        font-size: 1rem;
    }
    .above{
        top:0;
        left: 10px;
        background: var(--app_bg);
        /* border: 1px solid blue; */
        font-size: 1.5rem;
    }
    .center{
        top: 50%;
        left: 10px;
        /* border: 1px solid transparent; */
        opacity:0;
    }
    .error{
        color: coral;
        font-size:0.9rem;
    }
    .spin{
        animation: spin 2s infinite;
    }

    .swipeLeft{
        animation: swipeLeft 500ms forwards;
    }

    .swipeRight{
        animation: swipeRight 500ms forwards;
    }

    .resize{
        animation: changeSize 500ms;
    }

    @keyframes swipeLeft{
        0%{
            transform: translateX(0);
        }
        100%{
            transform: translateX(calc(-100% - 1rem));
        }
    
    }

    @keyframes swipeRight{
        0%{
            transform: translateX(calc(-100% - 1rem));
        }
        100%{
            transform: translateX(0);
        }
    }

    @keyframes spin {
        from{
            transform: rotate(0deg);
        }
        to{
            transform: rotate(360deg);
        }
    }
</style>
