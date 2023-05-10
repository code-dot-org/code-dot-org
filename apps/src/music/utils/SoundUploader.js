export default class UniqueSounds {
  constructor(player) {
    this.player = player;
    this.currentUploadSoundIndex = 0;
  }

  uploadSound(file) {
    const self = this;

    var reader = new FileReader();

    reader.onload = function (e) {
      console.log(
        'Loading',
        file.name,
        'into library item',
        self.currentUploadSoundIndex
      );

      // The uploaded sound will replace a sound in the library.
      self.player.loadSoundFromBuffer(
        self.currentUploadSoundIndex,
        e.target.result
      );

      // And if we upload again, we'll replace the next sound in the library.
      self.currentUploadSoundIndex++;
    };

    reader.readAsArrayBuffer(file);
  }
}
