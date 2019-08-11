module.exports = class Video {
  constructor(imageSize) {
    this.videoPlaying = false;
    this.imageSize = imageSize;
  }

  isPlaying() {
    return this.videoPlaying;
  }

  getVideoElement() {
    return this.videoElement;
  }

  async loadVideo(video) {
    this.videoElement = video;
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
      video.srcObject = stream;
      video.width = this.imageSize;
      video.height = this.imageSize;
      video.addEventListener('playing', () => this.videoPlaying = true);
      video.addEventListener('paused', () => this.videoPlaying = false);
    });
  }

  getFrameDataURI() {
    const canvas = document.createElement('canvas');
    canvas.width = this.imageSize / 4;
    canvas.height = this.imageSize / 4;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
};
