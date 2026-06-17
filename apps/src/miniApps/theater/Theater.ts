import {STATUS_MESSAGE_PREFIX} from '@cdo/apps/javalab/constants';

import {
  TheaterSignalType,
  THEATER_IMAGE_ID,
  THEATER_AUDIO_ID,
} from './constants';

interface TheaterSignal {
  value: TheaterSignalType;
  detail?: {
    url?: string;
    prompt?: string;
    uploadUrl?: string;
  };
}

// Theater plays a single generated image alongside generated audio. Javabuilder
// delivers the two separately, so we wait for both the image and the audio (or
// a NO_AUDIO signal) to load before revealing the image and starting playback,
// keeping the two in sync.
export default class Theater {
  private readonly onOutputMessage: (message: string) => void;
  private readonly onNewlineMessage: () => void;
  private readonly setIsRunning: (isRunning: boolean) => void;
  private loadEventsFinished: number;
  private hasAudio: boolean;

  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    setIsRunning: (isRunning: boolean) => void
  ) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.setIsRunning = setIsRunning;
    this.loadEventsFinished = 0;
    this.hasAudio = false;
  }

  handleSignal(data: TheaterSignal) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        this.hasAudio = true;
        const audio = this.getAudioElement();
        if (audio && data.detail?.url) {
          audio.src = data.detail.url + this.getCacheBustSuffix();
          audio.oncanplaythrough = () => this.startPlayback();
        }
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        const img = this.getImgElement();
        if (img && data.detail?.url) {
          img.src = data.detail.url + this.getCacheBustSuffix();
          img.onload = () => this.startPlayback();
        }
        break;
      }
      case TheaterSignalType.GET_IMAGE: {
        // The photo prompter isn't ported to Java Lab 2 yet; degrade
        // gracefully instead of leaving the program hung waiting on an upload.
        this.onOutputMessage(
          `${STATUS_MESSAGE_PREFIX} Photo prompts are not yet supported in Java Lab 2.`
        );
        this.onNewlineMessage();
        break;
      }
      case TheaterSignalType.NO_AUDIO: {
        this.hasAudio = false;
        this.startPlayback();
        break;
      }
      default:
        break;
    }
  }

  startPlayback() {
    this.loadEventsFinished++;
    // Two load events are expected: the image, plus either the audio or a
    // NO_AUDIO signal. Wait for both before revealing the image and playing.
    if (this.loadEventsFinished > 1) {
      const img = this.getImgElement();
      if (img) {
        img.style.visibility = 'visible';
      }
      if (this.hasAudio) {
        this.getAudioElement()?.play();
      }
    }
  }

  reset() {
    this.loadEventsFinished = 0;
    const img = this.getImgElement();
    if (img) {
      img.style.visibility = 'hidden';
    }
    this.resetAudioAndVideo();
  }

  onStop() {
    this.resetAudioAndVideo();
  }

  onClose() {
    this.onNewlineMessage();
    this.onOutputMessage(`${STATUS_MESSAGE_PREFIX} Program completed.`);
    this.onNewlineMessage();
    // Codebridge leaves run/stop state to the mini-app once a run starts, the
    // same way neighborhood does; mark the run finished now that the program
    // has exited.
    this.setIsRunning(false);
  }

  resetAudioAndVideo() {
    const audio = this.getAudioElement();
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    const img = this.getImgElement();
    if (img) {
      img.src = '';
    }
    this.hasAudio = false;
  }

  getImgElement(): HTMLImageElement | null {
    return document.getElementById(THEATER_IMAGE_ID) as HTMLImageElement | null;
  }

  getAudioElement(): HTMLAudioElement | null {
    return document.getElementById(THEATER_AUDIO_ID) as HTMLAudioElement | null;
  }

  // Java Lab reuses asset urls across runs, so bust the cache to force a fresh
  // fetch each time the program produces a new image or audio track.
  getCacheBustSuffix(): string {
    return '?=' + new Date().getTime();
  }
}
