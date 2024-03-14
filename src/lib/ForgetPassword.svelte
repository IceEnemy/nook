<script>
    import '$lib/global.css';
    import '$lib/auth.css';
    import NookLogo from "./assets/NookLogo.svelte";
    import { authHandlers } from './store/store';
    import {slide} from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    let email = '';
    let authenticating = false;
    let error = false;
    let countdown = 30;
    let isTimerActive = false;

    async function handleInput(){
        if(authenticating || isTimerActive) return;

        error = false;
        isTimerActive = true;
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
        if(!error){
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
    .authContainer{
        height: auto;
    }
    form{
        gap: 2rem;
    }
    h1{
        font-size: 2.5rem;
    }
</style>
