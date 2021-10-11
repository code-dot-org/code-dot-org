export function resetAudioElement(audioElement) {
  audioElement.pause();
  resetMediaElement(audioElement);
}

export function resetMediaElement(element) {
  element.onerror = undefined;
  element.src = '';
}
