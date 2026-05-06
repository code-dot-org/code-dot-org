/** Typed interface for the soundLibrary JS module. */
declare const soundLibrary: {
  playSound(categoryName: string, volume?: number): void;
  loadSounds(): void;
  injectSoundAPIs(options: {
    registerSound: (descriptor: {id: string; mp3: string}) => void;
    playSound: (id: string, options?: {volume?: number}) => void;
  }): void;
};
export default soundLibrary;
