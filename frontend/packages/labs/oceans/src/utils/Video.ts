/** Wraps a browser `<video>` element to stream webcam frames for ML classification. */
export default class Video {
  private videoPlaying: boolean;
  private readonly imageSize: number;
  private videoElement: HTMLVideoElement | undefined;

  /** @param imageSize - Pixel size (width and height) used when capturing frames. */
  constructor(imageSize: number) {
    this.videoPlaying = false;
    this.imageSize = imageSize;
  }

  /** Returns true while the camera stream is actively playing. */
  isPlaying(): boolean {
    return this.videoPlaying;
  }

  /** Returns the managed video element, if one has been loaded. */
  getVideoElement(): HTMLVideoElement | undefined {
    return this.videoElement;
  }

  /**
   * Attaches the user's webcam stream to `video` and begins playback.
   *
   * No-ops if `video` is falsy (can happen on re-play).
   *
   * @param video - The `<video>` DOM element to receive the stream.
   */
  async loadVideo(video: HTMLVideoElement | null): Promise<void> {
    if (!video) {
      return;
    }
    this.videoElement = video;
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    navigator.mediaDevices
      .getUserMedia({video: true, audio: false})
      .then(stream => {
        video.srcObject = stream;
        video.width = this.imageSize;
        video.height = this.imageSize;
        video.addEventListener('playing', () => (this.videoPlaying = true));
        video.addEventListener('paused', () => (this.videoPlaying = false));
      });
  }

  /**
   * Captures a single frame from the video element and returns it as a JPEG
   * data URI, scaled to `size × size` pixels.
   *
   * @param size - Output pixel size; defaults to `imageSize / 4`.
   * @returns JPEG data URI string.
   */
  getFrameDataURI(size?: number): string {
    const captureSize = size ?? this.imageSize / 4;
    const canvas = document.createElement('canvas');
    canvas.width = captureSize;
    canvas.height = captureSize;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(this.videoElement!, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }
}
