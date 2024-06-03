import { writable, get } from 'svelte/store';

export const isPlaying = writable(false);
export const currentTrack = writable(null);
export const audioProgress = writable(0);
export const audioDuration = writable(0);
export const isLooping = writable(false);
export const isRandom = writable(false);

let audioElements = {};

const songArr = [
  {
    name: "Ciudades LoFi",
    author: "RAME - Syncopation Station",
    duration: "1:59",
    path: "../src/lib/assets/ciudades-lo-fi-music-produced-by-rame-syncopation-station-198728.mp3",
    thumbnail: "../src/lib/assets/cicImg.png"
  },
  {
    name: "Deep LoFi Vibes",
    author: "Xethrocc",
    duration: "3:18",
    path: "../src/lib/assets/deep-lofi-vibes-205062.mp3",
    thumbnail: "../src/lib/assets/deepImg.png"
  },
  {
    name: "LoFi Hip-Hop - Coffee and Tapes",
    author: "LFC Records",
    duration: "2:04",
    path: "../src/lib/assets/lofi-hip-hop-background-music-coffee-and-tapes-211148.mp3",
    thumbnail: "../src/lib/assets/tapeImg.png"
  }
];

const updateProgress = (index) => {
  audioProgress.set(audioElements[index].currentTime);
};

const updateDuration = (index) => {
  audioDuration.set(audioElements[index].duration);
};

export const playTrack = (index) => {
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

export const playPause = () => {
  const current = get(currentTrack);
  if (audioElements[current]) {
    if (get(isPlaying)) {
      audioElements[current].pause();
      isPlaying.set(false);
    } else {
      audioElements[current].play();
      isPlaying.set(true);
    }
  }
};

export const nextTrack = () => {
  let nextIndex = get(currentTrack) + 1;
  if (get(isRandom)) {
    nextIndex = Math.floor(Math.random() * songArr.length);
  } else if (nextIndex >= songArr.length) {
    nextIndex = 0;
  }
  playTrack(nextIndex);
};

export const prevTrack = () => {
  let prevIndex = get(currentTrack) - 1;
  if (prevIndex < 0) {
    prevIndex = songArr.length - 1;
  }
  playTrack(prevIndex);
};

export const toggleLoop = () => {
  isLooping.set(!get(isLooping));
};

export const toggleRandom = () => {
  isRandom.set(!get(isRandom));
};

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const initializeAudioElements = () => {
  if (typeof window !== 'undefined') {
    songArr.forEach((_, index) => {
      if (!audioElements[index]) {
        const audio = new Audio(songArr[index].path);
        audio.volume = 0.2;
        audio.addEventListener('timeupdate', () => updateProgress(index));
        audio.addEventListener('loadedmetadata', () => updateDuration(index));
        audio.addEventListener('ended', () => {
          if (get(isLooping)) {
            audio.play();
          } else {
            nextTrack();
          }
        });
        audioElements[index] = audio;
      }
    });
  }
};

// Call the function to initialize audio elements
initializeAudioElements();

export { songArr, initializeAudioElements };

