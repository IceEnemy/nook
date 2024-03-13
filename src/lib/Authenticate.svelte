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
    let secondStep = false;
    let slid = false;
    let anim = false;
    let register = false;
    let authenticating = false;

    function passwordRequirements(password){
        // password needs to be atleast 8 letters long, contain atleast 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        return passwordRegex.test(password);
    }

    async function handleAuthenticate(){
        if(register && !slid){
            secondStep = true;
            slid = true;
            return;
        }
        if(authenticating){
            return;
        }
    
        if(!email || !password ||(register && !username) || (register && !confirmPassword) ){
            error = true;
            console.log("Error: ");
            return;
        }

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

                await authHandlers.signup(email, password, username);

            }
        }
        catch(err){
            console.log("Authenticating Error: ", err);
            error = true;
            authenticating = false;
        }
        finally{
            authenticating = false;
        }
        
    }

    $: swipeClass = slid ? 'swipeLeft' : 'swipeRight';

    function handleSecondStepRemove(){
        if(!slid){
            secondStep = false;
        }
    }
</script>
<div class="authContainer">
    <div class="logoDesc">
        <NookLogo color='var(--text_high_contrast)' width=160/>
        <h1>{register? 'SIGN UP' : 'SIGN IN'}</h1>
        {#if error}
            <p transition:slide={{duration: 500, easing: cubicOut}} class="error">Information Entered not correct!</p>
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
                    <input type="password" placeholder="Password" bind:value={password}>
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
                        <input type="tel" placeholder="Phone Number" bind:value={phoneNumber}>
                    </label>
                </div>
            {/if}
        </div>
        
        <div class='checks {anim ? 'resize' : ''}'>
            
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
    

</div>
<div class="authImage">

</div>
<style>
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
        gap: 2rem;
        margin: 4rem 0 2rem 0;
    }

    .checks{
        display: flex;
        height: 2rem;
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
        /* transition: gap 300ms ease-out; */
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
