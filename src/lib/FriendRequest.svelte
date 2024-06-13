<script>
    export let id;

    const name = "Jeff";
    const pfp = 'https://www.placebear.com/250/250'
</script>

<div class="contactContainer">
    <img src={pfp} alt="Profile Picture" class = "imgContainer">
    <div class="contactText">
        <h2>{name}</h2>
        <div class="choice">
            <span>Wants to be friends!</span>
            <div class="choiceButtons">
                <button class="acceptButton"><span class="ion--checkmark-outline icon"></span></button>
                <button class="denyButton"><span class="entypo--cross icon"></span></button>
            </div>
        </div>
    </div>
    
</div>

<style>
    .acceptButton:hover{
        color: var(--yellow_green);
    }
    .denyButton:hover{
        color: var(--imperial_red);
    }
    .choiceButtons{
        gap: 5px;
    }
    .choiceButtons button{
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
    .choice{
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .imgContainer{
        width: 50px;
        height: 50px;
    }
    .contactText{
        display: flex;
        flex-direction: column;
        width: 100%;
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