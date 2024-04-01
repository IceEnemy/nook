<svelte:head>
    <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/7.13.2/firebase-database.js"></script>

  <!-- CodeMirror -->
    <script src="../src/lib/firepad/codemirror.js"></script>
    <link rel="stylesheet" href="../src/lib/firepad/codemirror.css"/>

  <!-- Firepad -->
    <link rel="stylesheet" href="../src/lib/firepad/firepad.css" />
    <script src="../src/lib/firepad/firepad.js"></script>

    <!--UserList-->
    <script src="../src/lib/firepad/userlist.js"></script>
    <link rel="stylesheet" href="../src/lib/firepad/userlist.css" />
</svelte:head>

<script>
    import { authStore } from '$lib/store/store';
    // import { ref } from 'firebase/database';
    import { rtdb, auth, firebaseConfig, db} from '$lib/firebase/firebase';
    import { onMount } from 'svelte';
    import firebase from 'firebase/compat/app';
    import 'firebase/compat/auth';
    import 'firebase/compat/database';
    

    export let noteId = '';
    export let userId = '';
    export let username = '';

    onMount(() => {
        init();
    });
    function init() {


        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app(); // if already initialized, use that one
        }

        var firepadRef = getExampleRef();

        var codeMirror = CodeMirror(document.getElementById('firepad'), { lineWrapping: true });

        var userId = Math.floor(Math.random() * 9999999999).toString();

        var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
            richTextToolbar: true,
            richTextShortcuts: true,
            userId: userId
        });

        var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
            document.getElementById('userlist'), userId);

        //// Initialize contents.
        firepad.on('ready', function() {
            if (firepad.isHistoryEmpty()) {
            firepad.setText('Check out the user list to the left!');
            }
        });
    }

    // Helper to get hash from end of URL or generate a random one.
    function getExampleRef() {
      var ref = firebase.database().ref();
      var hash = window.location.hash.replace(/#/g, '');
      if (hash) {
        ref = ref.child(hash);
      } else {
        ref = ref.push(); // generate unique location.
        window.location = window.location + '#' + ref.key; // add it as a hash to the URL.
      }
      if (typeof console !== 'undefined') {
        console.log('Firebase data: ', ref.toString());
      }
      return ref;
    }

</script>

<div id="noteContainer">
  <div id="userlist"></div>
  <div id="firepad"></div>
</div>




<style>
    #noteContainer {
      display: flex;
      flex-direction: column;
    }
    #userlist {
      position: absolute; left: 0; top: 0; bottom: 0; height: auto;
      background-color: wheat;
      /* width: 175px; */
    }
    #firepad {
      position: absolute; left: 175px; top: 0; bottom: 0; right: 0;
    }
  </style>
