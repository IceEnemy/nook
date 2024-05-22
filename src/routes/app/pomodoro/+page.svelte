<script>
    import Timer from '$lib/Timer.svelte';
</script>

<div class="header">
    <h1>Pomodoro Timer</h1>
</div>

<div class="Timers">
    <Timer/>
    <Timer/>
    <Timer/>
</div>

<style>
    .Timers{
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-top: 75px;
    }

    .header{
        color: var(--default_white);
        position: absolute;
        display: flex;
        /* justify-content: center; */
        align-items: center;
        height: 90px;
        width: calc(100vw - 18rem);
        padding-left: 40px;
        top: 0;
        left:0;
        background-color: var(--darker_van_dyke);
    }
</style>