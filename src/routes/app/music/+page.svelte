<!-- src/routes/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import { isPlaying, currentTrack, audioProgress, audioDuration } from '$lib/store/music.js';
  
    let audioElements = {};
    let songArr = [
      {
        name: "Ciudades LoFi",
        author: "RAME - Syncopation Station",
        duration: "1:59",
        path: "../src/lib/assets/ciudades-lo-fi-music-produced-by-rame-syncopation-station-198728.mp3"
      },
      {
        name: "Deep LoFi Vibes",
        author: "Xethrocc",
        duration: "3:18",
        path: "../src/lib/assets/deep-lofi-vibes-205062.mp3"
      },
      {
        name: "LoFi Hip-Hop - Coffee and Tapes",
        author: "LFC Records",
        duration: "2:04",
        path: "../src/lib/assets/lofi-hip-hop-background-music-coffee-and-tapes-211148.mp3"
      }
    ];
  
    const updateProgress = (index) => {
      audioProgress.set(audioElements[index].currentTime);
    };
  
    const updateDuration = (index) => {
      audioDuration.set(audioElements[index].duration);
    };
  
    const playTrack = (index) => {
      // Pause other tracks
      Object.keys(audioElements).forEach((key) => {
        if (key != index) {
          audioElements[key].pause();
          audioElements[key].currentTime = 0;
        }
      });
  
      // Play the selected track
      currentTrack.set(index);
      audioElements[index].play();
      isPlaying.set(true);
  
      // Reset progress and duration
      audioProgress.set(0);
      audioDuration.set(audioElements[index].duration);
    };
  
    onMount(() => {
      songArr.forEach((_, index) => {
        const audio = new Audio(songArr[index].path);
        audio.addEventListener('timeupdate', () => updateProgress(index));
        audio.addEventListener('loadedmetadata', () => updateDuration(index));
        audioElements[index] = audio;
      });
    });
  </script>
  
  <main>
    <div class="container">
      <div class="header">
        <h1>Music Player</h1>
      </div>
  
      <div class="music">
        <div class="thumbnails">
          hey
        </div>
        <div class="musicChoice">
          <div class="choiceHead">
            <p>#</p>
            <p>Name</p>
            <p>Author</p>
            <p>Duration</p>
          </div>
          {#each songArr as song, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="song" on:click={() => playTrack(i)}>
              <p>{i + 1}</p>
              <p>{song.name}</p>
              <p>{song.author}</p>
              <p>{song.duration}</p>
            </div>
          {/each}
        </div>
      </div>
  
      <div class="footer">
        {#if $currentTrack !== null}
          <p>Now Playing: {songArr[$currentTrack].name} by {songArr[$currentTrack].author}</p>
          <p>Progress: {$audioProgress.toFixed(2)} / {$audioDuration.toFixed(2)} seconds</p>
          <progress max={$audioDuration} value={$audioProgress}></progress>
        {/if}
      </div>
    </div>
  </main>
  
  <style>
    .choiceHead, .song {
      display: grid;
      grid-template-columns: 50px 1fr 1fr 80px;
      gap: 10px;
      padding: 10px;
      align-items: center;
      border-bottom: 2px solid var(--darker_van_dyke);
    }
  
    .song {
      border-bottom: 1px solid var(--dim_linen);
      cursor: pointer;
    }
  
    .thumbnails, .musicChoice {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  
    .thumbnails {
      width: 30%;
      background-color: var(--default_white);
      align-items: center;
      justify-content: center;
    }
  
    .musicChoice {
      width: 70%;
      background-color: var(--seasalt);
      padding: 3rem;
    }
  
    .music {
      display: flex;
      flex-direction: row;
      flex: 1;
    }
  
    .header, .footer {
      color: var(--default_white);
      display: flex;
      align-items: center;
      height: 90px;
      padding-left: 40px;
      background-color: var(--darker_van_dyke);
    }
  
    .footer {
      margin-top: auto;
    }
  
    .container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    progress {
    width: 50%;
    height: 10px;
    border-radius: 50%;
    -webkit-appearance: none;
    appearance: none;
  }

  progress::-webkit-progress-bar {
    background-color: #eee;
    border-radius: 5px;
  }

  progress::-webkit-progress-value {
    background-color: #4caf50;
    border-radius: 5px;
  }

  progress::-moz-progress-bar {
    background-color: #4caf50;
    border-radius: 5px;
  }
  </style>
  