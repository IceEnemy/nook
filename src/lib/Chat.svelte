<script>
    export let id;
    
    const name = "Jeff";
    const pfp = 'https://www.placebear.com/250/250'
</script>

<div class="chatContainer">
    <div class="chatHeader">
        <img src={pfp} alt="" class="imgContainer">
        <h1>{name}</h1>
    </div>


    <div class="chatContent">

    </div>

    <div class="chatFooter">
        <form>
            <label>
                <input type="text" placeholder="Type a message">
            </label>
            <button><span class="majesticons--send icon"></span></button>
        </form>
    </div>
</div>

<style>
    h1{
        color: var(--default_white);
    }
    .imgContainer{
        width: 50px;
        height: 50px;
    }
    .chatFooter form{
        width: 90%;
        height: 2rem;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .chatFooter button{
        background-color: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
    }
    .chatFooter input{
        /* width: 80%; */
        padding: 0.5rem 0.5rem 0.5rem 1rem;
        border-radius: 100px;
    }
    .chatFooter label{
        width: 95%;
        border-radius: 100px;
    }
    .chatContent{
        flex-grow: 1;
    }
    .chatHeader {
        background-color: var(--darker_van_dyke);
        width: 100%;
        height: 90px;
        padding: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
    }
    .chatFooter {
        background-color: var(--default_white);
        width: 100%;
        height: 70px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
    }
    .chatContainer {
        background: var(--coyote);
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
