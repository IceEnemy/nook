<script>
    export let id;

    const name = "Jeff";
    const pfp = 'https://www.placebear.com/250/250'
    const lastMessage = "Hey, how are you doing?"
</script>

<div class="contactContainer">
    <img src={pfp} alt="Profile Picture" class = "imgContainer">
    <div class="contactText">
        <h2>{name}</h2>
        <p>{lastMessage}</p>
    </div>
    
</div>

<style>
    .imgContainer{
        width: 50px;
        height: 50px;
    }
    .contactText{
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .contactContainer{
        width: 100%;
        padding: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        border-bottom: solid 1px;
    }
    h2{
        font-size: 1rem;
        color: var(--van_dyke);
    }
</style>