<script>
    import {goto} from '$app/navigation';
    import {rtdb, db} from '$lib/firebase/firebase.js';
    import {formatDate} from '$lib/store/store.js'
    import { ref, query, orderByKey, limitToLast, get } from 'firebase/database';
    import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
	import { onMount, createEventDispatcher } from 'svelte';
    export let title = '';
    // export let lastEdited = '';
    export let link = '';

    let initialData = true;
    let lastUpdate = '';
    let editOpen = false;
    const dispatch = createEventDispatcher();

    function handleOpenEdit(){
        // event.stopPropagation();
        editOpen = !editOpen;
    }

    function requestOpenPopup(detail){
        dispatch('openPopup', {detail, link, title})
    }

    function clickOutside(node) {
        // Event handler to check if click is outside the node
        const handleClick = event => {
                if (node && !node.contains(event.target) && !event.defaultPrevented) {
                    editOpen= false;
                }
        };

        const handleEscape = event => {
        if (event.key === 'Escape' || event.keyCode === 27) { 
            editOpen = false; 
        }
    };

        
        document.addEventListener('click', handleClick, true);

      
        document.addEventListener('keydown', handleEscape, true);

        return {
            destroy() {
                document.removeEventListener('click', handleClick, true);
            }
        };
    }

    onMount(async () => {
        getUpdate();
        initialData = false;
    });
    
    $: if(!initialData && link){
        getUpdate();
    }

    async function getUpdate(){
        const lastHistoryQuery = query(ref(rtdb, `${link}/history` ), orderByKey(), limitToLast(1));
            try{
            await get(lastHistoryQuery).then((snapshot) => {
                if(snapshot.exists()){
                    snapshot.forEach((childSnapshot) => {
                        lastUpdate = childSnapshot.val().t;
                    });
                }
            });
            if(lastUpdate){
                const firebaseRef = doc(db, 'notes', link);
                await updateDoc(firebaseRef, {
                    lastEdited: lastUpdate
                });
            }
            else{
                const docRef = await getDoc(doc(db, 'notes', link));
                lastUpdate = docRef.data().created;
            }
        } 
        catch(e){
            console.error(e);
        }
       
    }

    $: formatedDate = formatDate(lastUpdate);

    function handleRedirect(){
        goto(`/app/notes/${link}`);
    }
</script>

<button class="noteButton" on:dblclick={handleRedirect}>
    <div class="noteTitle">
        <div class="textTrunc">
            <p class="text">{title}</p>
        </div>
        

        <div class="dropdown" use:clickOutside>
            <button on:click={handleOpenEdit} on:dblclick={(event) => event.stopPropagation()}>
                <span class="tabler--dots icon"></span>
            </button>
            {#if editOpen}
                <div class="dropdown-content">
                    <button on:click={() => requestOpenPopup('titleNote')}>Edit</button>
                    <button on:click={() => requestOpenPopup('deleteNote')}>Delete</button>
                </div>
            {/if}
        </div>
        
    </div>
    <div class="previewImg">
        <span class="mingcute--file-fill giant-icon"></span>
    </div>
    <span class="text">Last Edited: {formatedDate}</span>
</button>

<style>
    .dropdown-content{
        min-width: 100px;
        right: 0;
    }
    .dropdown button{
        background: none;
        border: none;
        cursor: pointer;
    }
    .textTrunc{
        width: 70%;
        display: flex;
        align-items: center;
        
    }
    .noteTitle{
        width: 100%;
        display:flex;
        justify-content: space-between;
        align-items: center;
    }
    .previewImg{
        width: 100%;
        aspect-ratio: 1/1;
        background-color: aliceblue;
        display:flex;
        justify-content: center;
        align-items: center;
        /* height: width; */
    }

    .text{
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex-grow: 1; /* Take up remaining space */
    }
    .noteButton{
        /* position: relative; */
        display: flex;
        flex-direction: column;
        /* height: 16rem; */
        text-align: left;
        /* align-items: center; */
        gap: 0.5rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 1rem;
        color: var(--coyote);
        background: var(--dim_linen);
        border: none;
        border-radius: 5px;
    }
    .noteButton:hover{
        background-color: var(--almond);
    }
    p{
        font-size: 1rem;
        color: var(--text_high_contrast);
        font-weight: 600;
    }
</style>