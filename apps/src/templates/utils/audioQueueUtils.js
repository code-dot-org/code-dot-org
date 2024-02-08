export function addToQueue(prevQueue, inlineAudio, setAudioQueue) {
  setAudioQueue([...prevQueue, inlineAudio]);
}

export function playNextAudio(audioQueue, isPlaying) {
  if (audioQueue.length > 0) {
    const inlineAudio = audioQueue.shift();
    isPlaying.current = true;
    inlineAudio.playAudio();
  }
}

export function clearQueue(setAudioQueue, isPlaying) {
  setAudioQueue([]);
  isPlaying.current = false;
}
