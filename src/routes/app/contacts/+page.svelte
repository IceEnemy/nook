<script>
    import Contact from '$lib/Contact.svelte';

    let filter = ''
</script>

<div class="contactsList">
    <div class="msgHeader">
        <h1>Contacts</h1>
        <label class="searchContact">
            <span class="ic--round-search icon"></span>
            <input type="text" class="search" placeholder="Search contact" bind:value={filter}>
        </label>
    </div>
    
    
    
    <div class="msgs">
        <Contact/>
        <Contact/>
        <Contact/>
        <Contact/>
        <Contact/>
        
    </div>
    
</div>


<style>
    .msgHeader{
        width: 100%;
        height: 15%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        justify-content: center;
        align-items: center;
    }
    .search{
        width: 85%;
        height: 100%;
        border-radius: 10px ;
        background-color: transparent;
        font-size: 1rem;
        border: none;
        color: var(--van_dyke);
    }
    .searchContact{
        width: 80%;
        height: 3rem;
        border-radius: 10px;
        border: solid var(--dun) 1px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--default_white);
    }
    .contactsList{
        width: 30%;
        height: 100%;
        background-color: var(--linen);
        /* padding: 2rem; */
        /* overflow-y: scroll;  */
        /* gap: 1rem; */
        display: flex;
        flex-direction: column;
        align-items: center;

    }
    .msgs{
        width: 100%;

        overflow-y: scroll;
    }
    h1{
        color: var(--van_dyke);
        margin-top: 2rem;
    }
    .ic--round-search {
		/* top: 50px; */
		margin-left: 10px;
	}
    .search::placeholder{
        color: var(--chamoisee);
    }
</style>