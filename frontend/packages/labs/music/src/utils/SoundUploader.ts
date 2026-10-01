import type {MusicPlayer} from '../player';

export default class UniqueSounds {
  player: MusicPlayer;
  currentUploadSoundIndex: number;

  constructor(player: MusicPlayer) {
    this.player = player;
    this.currentUploadSoundIndex = 0;
  }

  uploadSound(file: File) {
    const reader = new FileReader();

    reader.onload = e => {
      console.log(
        'Loading',
        file.name,
        'into library item',
        this.currentUploadSoundIndex,
      );

      if (!e.target?.result || typeof e.target.result === 'string') {
        return;
      }

      // The uploaded sound will replace a sound in the library.
      this.player.loadSoundFromBuffer(
        this.currentUploadSoundIndex,
        e.target.result,
      );

      // And if we upload again, we'll replace the next sound in the library.
      this.currentUploadSoundIndex++;
    };

    reader.readAsArrayBuffer(file);
  }
}
