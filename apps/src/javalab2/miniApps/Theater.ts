// Theater mini-app for lab2 Java Lab.
//
// Port of `apps/src/javalab/theater/Theater.js`. The legacy class drove an
// <img>/<audio> pair addressed by DOM ids (`#theater`, `#theater-audio`);
// this version takes refs from the React component so the canvas can be
// embedded inside codebridge's preview pane without colliding with the
// legacy ids.
//
// Wire protocol (from Javabuilder) is unchanged:
//   AUDIO_URL   - preload an audio file then start playback
//   VISUAL_URL  - preload an image then start playback
//   NO_AUDIO    - this run produced no audio; start playback immediately
//   GET_IMAGE   - open the photo prompter with the supplied uploadUrl + prompt
//
// Two load events (audio + visual, or NO_AUDIO + visual) must arrive before
// playback begins so the image and audio start in sync.
import {TheaterController} from '@codebridge/CodebridgeRegistry';

import {TheaterSignalType} from './theaterConstants';

export interface TheaterSignal {
  value: TheaterSignalType;
  detail?: {
    url?: string;
    uploadUrl?: string;
    prompt?: string;
  };
}

export interface TheaterHooks {
  getImg: () => HTMLImageElement | null;
  getAudio: () => HTMLAudioElement | null;
  openPrompter: (prompt: string, uploadUrl: string) => void;
  closePrompter: () => void;
  onProgramCompleted: () => void;
}

export default class Theater implements TheaterController {
  private hooks: TheaterHooks;
  private loadEventsFinished = 0;
  private hasAudio = false;

  constructor(hooks: TheaterHooks) {
    this.hooks = hooks;
  }

  handleSignal(data: unknown): void {
    const signal = data as TheaterSignal;
    switch (signal.value) {
      case TheaterSignalType.AUDIO_URL: {
        const audio = this.hooks.getAudio();
        if (!audio || !signal.detail?.url) return;
        this.hasAudio = true;
        audio.src = signal.detail.url + this.cacheBust();
        audio.oncanplaythrough = () => this.startPlayback();
        return;
      }
      case TheaterSignalType.VISUAL_URL: {
        const img = this.hooks.getImg();
        if (!img || !signal.detail?.url) return;
        img.src = signal.detail.url + this.cacheBust();
        img.onload = () => this.startPlayback();
        return;
      }
      case TheaterSignalType.GET_IMAGE: {
        const {uploadUrl, prompt} = signal.detail ?? {};
        if (!uploadUrl) return;
        this.hooks.openPrompter(prompt ?? '', uploadUrl);
        return;
      }
      case TheaterSignalType.NO_AUDIO:
        this.hasAudio = false;
        this.startPlayback();
        return;
      default:
        return;
    }
  }

  reset(): void {
    this.loadEventsFinished = 0;
    const img = this.hooks.getImg();
    if (img) {
      img.style.visibility = 'hidden';
    }
    this.resetAudioAndVideo();
  }

  onRun(): void {
    this.reset();
  }

  onStop(): void {
    this.resetAudioAndVideo();
    this.hooks.closePrompter();
  }

  onClose(): void {
    this.hooks.onProgramCompleted();
    this.hooks.closePrompter();
  }

  private startPlayback(): void {
    this.loadEventsFinished++;
    // Wait for both load events (audio + visual, or NO_AUDIO + visual) so
    // image and audio start together.
    if (this.loadEventsFinished < 2) return;
    const img = this.hooks.getImg();
    if (img) img.style.visibility = 'visible';
    if (this.hasAudio) {
      this.hooks.getAudio()?.play();
    }
  }

  private resetAudioAndVideo(): void {
    const audio = this.hooks.getAudio();
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    const img = this.hooks.getImg();
    if (img) img.src = '';
    this.hasAudio = false;
  }

  private cacheBust(): string {
    return `?=${Date.now()}`;
  }
}
