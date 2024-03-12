<script>
    import '$lib/global.css'
	import { authHandlers } from './store/store';
    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let error = false;
    let register = false;
    let authenticating = false;

    function passwordRequirements(password){
        // password needs to be atleast 8 letters long, contain atleast 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        return passwordRegex.test(password);
    }

    async function handleAuthenticate(){
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
</script>
<div class="authContainer">
    <form>
        <h1>{register? 'Register' : 'Login'}</h1>
        {#if error}
            <p class="error">Information Entered not correct!</p>
        {/if}
        {#if register}
        <label>
            <p class={username ? 'above' : 'center'}>Username</p>
            <input type="text" placeholder="Username" bind:value={username}>
        </label>
        {/if}
        <label>
            <p class={email ? 'above' : 'center'}>Email</p>
            <input type="email" placeholder="Email" bind:value={email}>
        </label>
        <label>
            <p class={password ? 'above' : 'center'}>Password</p>
            <input type="password" placeholder="Password" bind:value={password}>
        </label>
        {#if register}
        <label>
            <p class={confirmPassword ? 'above' : 'center'}>Confirm Pssword</p>
            <input type="password" placeholder="Confirm Password" bind:value={confirmPassword}>
        </label>
        {/if}

        {#if register}
            <button type="button" on:click={() => register = false}>Login</button>
        {:else}
            <button type="button" on:click={() => register = true}>Register</button>
        {/if}
        
        <button type="button" on:click={handleAuthenticate}>
            {#if authenticating}
            <i class="fa-solid fa-spinner spin"></i>
            {:else}
                Submit
            {/if}
        </button>
    </form>

</div>

<style>
    .authContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background:var(--lighter_clr);
        width: 80%;
        height: 50%;
        margin: 0 auto;
        /* flex: 1; */
        color: var(--prim_clr);
    }
    form{
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 400px;
        max-width: 100%;
        margin: 0 auto;
    }
    form label {
        position: relative;
        border: 1px solid var(--light_clr);
        border-radius: 5px;
        background-color: white;
    }
    form input{
        width: 100%;
        border: none;
        background : transparent;
        color: var(--prim_clr);

        padding: 8px 14px;
    }

    form input::placeholder{
        color: var(--light_clr);
    }

    form input:focus{
        outline: none;
    }

    h1 {
        text-align: center;
    }
    form button{
        background: var(--prim_clr);
        color: var(--lighter_clr);
        border:none;
        padding: 10px 0;
        border-radius: 5px;
        cursor: pointer;
        display: grid;
        place-items: center;
    }

    form button:hover{
        background: blue;
    }
    .above, .center {
        position: absolute;
        transform: translateY(-50%);
        pointer-events: none;
        color: black;
        border-radius: 4px;
        padding: 0 6px;
        font-size: 0.8rem;
    }
    .above{
        top:0;
        left: 24px;
        background: var(--prim_clr);
        border: 1px solid blue;
        font-size: 0.7rem;
    }
    .center{
        top: 50%;
        left: 6px;
        border: 1px solid transparent;
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
