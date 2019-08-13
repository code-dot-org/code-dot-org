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

  /**
   * @param {HTMLVideoElement} video
   * @returns {Promise<void>}
   */
  async loadVideo(video) {
    if (!video) {
      // This case seems to occur on re-playing.
      return;
    }
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

  getFrameDataURI(size) {
    size = size || this.imageSize / 4;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
};
