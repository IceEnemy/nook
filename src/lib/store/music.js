import {writable} from 'svelte/store';

export const isPlaying = writable(false);
export const currentTrack = writable(null);
export const audioProgress = writable(0);
export const audioDuration = writable(0);
