<script>
    import '$lib/global.css';
    import NookLogo from "./assets/NookLogo.svelte";
    import { authHandlers } from './store/store';
    import {slide} from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let email = '';
    //checkning the load state
    let authenticating = false;
    let error = false;
    //default countdown of whether or not the user can resend the email
    let countdown = 30;
    //stores whether or not the timer is active
    let isTimerActive = false;

    async function handleInput(){
        //if the page is loading or the timer is active, then the button will not work
        if(authenticating || isTimerActive) return;

        //reset the error state per button click, and set the loading state to true
        error = false;
        authenticating = true;
        try{
            await authHandlers.resetPassword(email);
            console.log('Reset Password');
        }catch(e){
            console.log(e);
            error = true;
            authenticating = false;
        }
        authenticating = false;

        //if the email was successfully sent, then the timer will start
        if(!error){
            isTimerActive = true;
            let interval = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(interval);
                    isTimerActive = false;
                    countdown = 30;
                }
            }, 1000);
        }
    }
</script>

<div class="authContainer">
    <div class="logoDesc">
        <NookLogo color='var(--text_high_contrast)' width=160/>
        <h1>Reset Password</h1>
        {#if error}
            <p transition:slide={{duration: 500, easing: cubicOut}} class="error">An Error has occured!</p>
        {/if} 
    </div>
    <form>
        <div class="inputs">
            <label>
                <p class={email ? 'above' : 'center'}>Email</p>
                <input type="email" placeholder="Email" bind:value={email}>
            </label>
        </div>
        <button type="button" on:click={handleInput}>
            {#if authenticating}
                <i class="fa-solid fa-spinner spin"></i>
            {:else}
                {#if isTimerActive}
                    <p>Resend in {countdown}</p>
                {:else}
                    <p>Send Reset Link</p>
                {/if}
            {/if}
        </button>
    </form>
</div>

<style>
    .logoDesc{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        margin: 4rem 0 2rem 0;
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
        height: auto;
        
        /* margin: 0 auto; */
        /* flex: 1; */
        color: var(--text_high_contrast);
    }
    form{
        display: flex;
        flex-direction: column;
        /* gap: 2rem; */
        /* width: 400px; */
        /* max-width: 100%; */
        gap: 2rem;
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
        font-size: 2.5rem;
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

    @keyframes spin {
        from{
            transform: rotate(0deg);
        }
        to{
            transform: rotate(360deg);
        }
    }
</style>
