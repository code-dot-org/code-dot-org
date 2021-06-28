export default class Theater {
  constructor() {
    this.canvas = null;
    this.context = null;
  }

  handleSignal(data) {
    if (data.detail.image) {
      const imageString = 'data:image/gif;base64,' + data.detail.image;
      const imgElement = this.getImgElement();
      imgElement.src = imageString;
    }
    if (data.detail.audio) {
      const audioString = 'data:audio/wav;base64,' + data.detail.audio;
      const audioElement = this.getAudioElement();
      audioElement.src = audioString;
    }
  }

  reset() {
    const imgElement = this.getImgElement();
    imgElement.src = '';
  }

  getImgElement() {
    return document.getElementById('theater');
  }

  getAudioElement() {
    return document.getElementById('theater-audio');
  }
}
