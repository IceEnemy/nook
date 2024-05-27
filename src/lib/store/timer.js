import { writable, get } from 'svelte/store';
import {db} from '$lib/firebase/firebase.js';
import { authStore } from '$lib/store/store.js';
import {doc, updateDoc, getDoc} from 'firebase/firestore';

export const timerId = writable(null);
export const timer = writable(0);
export const isRunning = writable(false);
export const timerState = writable('working');
export const globalWorkTime = writable(1200);
export const globalBreakTime = writable(300);
export const lapLimit = writable(2);
export const lapCount = writable(0);

let interval;

export function startTimer() {
  if (!interval) {
    timer.set(get(timerState) === 'working' ? get(globalWorkTime) : get(globalBreakTime));
    interval = setInterval(() => {
      timer.update(n => {
        if (n > 1 && get(lapCount) < get(lapLimit)){
          console.log('timer', n);
          console.log('lapCount', get(lapCount));
          console.log('lapLimit', get(lapLimit));
          return n - 1;
          
        }
        else{
          switchTimerState();
          console.log('timer', n);
          return get(timer);
        }
        // else {
        //   resetTimer();
        //   return 0;
        // }
      });
    }, 1000);
    isRunning.set(true);
  }
}

export function stopTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
    isRunning.set(false);
  }
}

export function resetTimer() {
  console.log('resetTimer');
  stopTimer();
  timer.set(get(globalWorkTime));
  lapCount.set(0);
  timerState.set('working');

  setTimeout(() => {
    timerId.set(null);
  }, 10);
  

  console.log('timer', get(timer));
  console.log('lapCount', get(lapCount));
  console.log('timerState', get(timerState));
}

function switchTimerState() {
  timerState.update(state => {
    if (state === 'working') {
      // Set the timer for the break period
      lapCount.update(n => n + 1);
      timer.set(get(globalBreakTime)); // e.g., 5 minutes break
      if(get(lapCount) < get(lapLimit)) return 'break';
      else { 
        resetTimer();
        return 'working'

      }
    } else {
      // Set the timer for the working period
      timer.set(get(globalWorkTime)); 
      return 'working';
    }
  });
}

export async function updateTime(time, id, type) {
  const timerRef = doc(db,'users',get(authStore).user.uid,'timers',id);
  await updateDoc(timerRef, {
    [type]: time
  });
  if(type === 'workTime') {
    globalWorkTime.set(time);
  }
  else {
    globalBreakTime.set(time);
  }
}

export async function updateLapCount(id, amount) {
  const timerRef = doc(db, 'users', get(authStore).user.uid, 'timers', id);
  const timerDoc = await getDoc(timerRef);
  if (timerDoc.exists()) {
    const currentLapCount = timerDoc.data().lapCount || 0;
    const newLapCount = currentLapCount + amount;
    await updateDoc(timerRef, {
      lapCount: newLapCount
    });
    lapLimit.set(newLapCount); // Update the local lapCount store
  }
}

export async function updateTimerTitle(name, id) {
  const timerRef = doc(db,'users',get(authStore).user.uid,'timers',id);
  await updateDoc(timerRef, {
    title: name
  });
}
