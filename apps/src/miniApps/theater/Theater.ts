import {
  STATUS_MESSAGE_PREFIX,
  InputMessageType,
} from '@cdo/apps/javalab/constants';
import javalabMsg from '@cdo/apps/javalab/locale';
import MiniApp from '@cdo/apps/miniApps/MiniApp';

import {
  InputMessage,
  THEATER_AUDIO_ID,
  THEATER_IMAGE_ID,
  TheaterSignalType,
} from './constants';

interface TheaterSignal {
  value: string;
  detail: {
    url?: string;
    uploadUrl?: string;
    prompt?: string;
    // Only provided with VISUAL_URL, and only from a host that knows how long its gif runs (python).
    durationMs?: number;
  };
}

type MediaLoadErrorCallback = (type: 'video' | 'audio') => void;

type UploadCallback = (this: XMLHttpRequest, event: ProgressEvent) => void;

type MediaElement = HTMLImageElement | HTMLAudioElement;

function cacheBustSuffix() {
  return '?=' + new Date().getTime();
}

// One media element and the object url currently behind it. The url is kept
// here rather than read back off the element because a reset can arrive after
// React has unmounted the element, and a url we can no longer read is a url we
// can never revoke.
class TrackedSource {
  private readonly getElement: () => MediaElement | null;
  private blobUrl: string | null;

  constructor(getElement: () => MediaElement | null) {
    this.getElement = getElement;
    this.blobUrl = null;
  }

  // Java Lab sources are remote urls, cache-busted so a rerun re-fetches rather
  // than reusing the previous run's file. Python Lab produces media in the
  // browser and passes a blob: url, which must be used verbatim (a query suffix
  // is not part of a registered object url) and revoked once dropped, or it is
  // held for the life of the page.
  set(url: string | undefined) {
    const nextUrl =
      url && (url.startsWith('blob:') || url.startsWith('data:'))
        ? url
        : url + cacheBustSuffix();
    this.clear();
    const element = this.getElement();
    if (element) {
      element.src = nextUrl;
    }
    if (nextUrl.startsWith('blob:')) {
      this.blobUrl = nextUrl;
    }
  }

  clear() {
    const element = this.getElement();
    if (element) {
      // Detach before dropping the src: a load already in flight is for media we
      // are discarding, and clearing the src can itself fire an error event.
      element.onload = null;
      element.onerror = null;
      element.oncanplaythrough = null;
      // Remove the attribute rather than assign '', which browsers treat as a
      // url to load.
      element.removeAttribute('src');
      // An audio element holds the resource it already selected until told to
      // look again, which is what frees the object url we are about to revoke.
      if ('load' in element) {
        element.load();
      }
      element.onended = null;
    }
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}

export default class Theater extends MiniApp {
  private readonly onOutputMessage: (message: string) => void;
  private readonly onNewlineMessage: () => void;
  private readonly openPhotoPrompter: (prompt?: string) => void;
  private readonly closePhotoPrompter: () => void;
  private readonly onJavabuilderMessage: (
    messageType: string,
    message: InputMessage
  ) => void;
  private readonly onOutputVisibleChange?: (isVisible: boolean) => void;
  private readonly onMediaLoadError?: MediaLoadErrorCallback;
  // Playback starts once both the visual and the audio are ready, where ready
  // audio means a loaded track or the NO_AUDIO signal. Each signal clears its
  // own flag, so a second publish waits for its own media instead of riding on
  // what the first one loaded.
  private isVisualLoaded: boolean;
  private isAudioReady: boolean;
  private prompterUploadUrl: string | null;
  private hasAudio: boolean;
  private hasMedia: boolean;
  private visualDurationMs: number | null;
  private playbackTimer: number | null;
  private isPlaybackPending: boolean;
  private isAudioPlaying: boolean;
  private isVisualPlaying: boolean;
  private playbackGeneration: number;
  private playbackWaiters: Array<() => void>;
  private readonly imageSource: TrackedSource;
  private readonly audioSource: TrackedSource;

  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    openPhotoPrompter: (prompt?: string) => void,
    closePhotoPrompter: () => void,
    onJavabuilderMessage: (messageType: string, message: InputMessage) => void,
    onOutputVisibleChange?: (isVisible: boolean) => void,
    onMediaLoadError?: MediaLoadErrorCallback
  ) {
    super();
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.openPhotoPrompter = openPhotoPrompter;
    this.closePhotoPrompter = closePhotoPrompter;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.onOutputVisibleChange = onOutputVisibleChange;
    this.onMediaLoadError = onMediaLoadError;
    this.isVisualLoaded = false;
    this.isAudioReady = false;
    this.prompterUploadUrl = null;
    this.hasAudio = false;
    this.hasMedia = false;
    this.visualDurationMs = null;
    this.playbackTimer = null;
    this.isPlaybackPending = false;
    this.isAudioPlaying = false;
    this.isVisualPlaying = false;
    this.playbackGeneration = 0;
    this.playbackWaiters = [];
    this.imageSource = new TrackedSource(() => this.getImgElement());
    this.audioSource = new TrackedSource(() => this.getAudioElement());
  }

  handleSignal(data: TheaterSignal) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        // Wait for the audio to load before starting playback
        this.hasAudio = true;
        this.hasMedia = true;
        this.isPlaybackPending = true;
        this.isAudioReady = false;
        this.audioSource.set(data.detail.url);
        const audioElement = this.getAudioElement();
        if (audioElement) {
          audioElement.oncanplaythrough = () => {
            this.isAudioReady = true;
            this.startPlayback();
          };
          audioElement.onerror = () => this.handleMediaLoadError('audio');
        }
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        // Preload the image. Once it's ready, start the playback
        this.hasMedia = true;
        this.isPlaybackPending = true;
        this.visualDurationMs = data.detail.durationMs ?? null;
        this.isVisualLoaded = false;
        this.imageSource.set(data.detail.url);
        const imageElement = this.getImgElement();
        if (imageElement) {
          imageElement.onload = () => {
            this.isVisualLoaded = true;
            this.startPlayback();
          };
          imageElement.onerror = () => this.handleMediaLoadError('video');
        }
        break;
      }
      case TheaterSignalType.GET_IMAGE: {
        // Open the photo prompter
        this.prompterUploadUrl = data.detail.uploadUrl || null;
        this.openPhotoPrompter(data.detail.prompt);
        break;
      }
      case TheaterSignalType.NO_AUDIO: {
        // there is no audio associated with the video, so nothing to wait for
        this.hasAudio = false;
        this.isAudioReady = true;
        this.startPlayback();
        break;
      }
      default:
        break;
    }
  }

  startPlayback() {
    if (!this.isVisualLoaded || !this.isAudioReady) {
      return;
    }
    this.setOutputVisible(true);
    const audioElement = this.hasAudio ? this.getAudioElement() : null;
    this.watchForPlaybackEnd(audioElement, audioElement?.play());
  }

  // Watch what is playing so waitUntilPlaybackDone can settle when it ends.
  //
  // The gif's length has to come from the host, since an <img> reports nothing
  // about the animation it is running. Without one there is no telling when the
  // animation ends, so the gif does not hold playback open at all; waiting on a
  // length we never learn would park the caller until the next run resets us.
  private watchForPlaybackEnd(
    audioElement: HTMLAudioElement | null,
    playing: Promise<void> | undefined
  ) {
    // A program that publishes twice replaces what is playing, so the timer it
    // replaces must not decide when playback is over.
    this.clearPlaybackTimer();
    const generation = ++this.playbackGeneration;
    const isCurrentWatch = () => generation === this.playbackGeneration;
    this.isAudioPlaying = audioElement !== null;
    this.isVisualPlaying = this.visualDurationMs !== null;

    if (audioElement) {
      audioElement.onended = () => {
        if (isCurrentWatch()) {
          this.audioFinished();
        }
      };
      // A browser that refuses to start the audio never fires 'ended', so a
      // refusal counts as audio that is already over.
      playing?.catch(() => {
        if (isCurrentWatch()) {
          this.audioFinished();
        }
      });
    }
    if (this.visualDurationMs !== null) {
      this.playbackTimer = window.setTimeout(() => {
        this.playbackTimer = null;
        this.isVisualPlaying = false;
        this.settleIfPlaybackDone();
      }, this.visualDurationMs);
    }
    this.settleIfPlaybackDone();
  }

  private audioFinished() {
    this.isAudioPlaying = false;
    this.settleIfPlaybackDone();
  }

  // Resolves when the gif and audio this run published have finished playing,
  // and right away when nothing is playing.
  waitUntilPlaybackDone(): Promise<void> {
    if (!this.isPlaybackPending) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.playbackWaiters.push(resolve);
    });
  }

  private settleIfPlaybackDone() {
    if (this.isAudioPlaying || this.isVisualPlaying) {
      return;
    }
    // A publish still loading is playback that has not started yet, so the one
    // it replaces must not declare the run's playback over on its way out.
    if (!this.isVisualLoaded || !this.isAudioReady) {
      return;
    }
    this.settlePlayback();
  }

  // Let go of anything waiting on playback. Playback that is dropped rather
  // than finished -- a stop, a reset, media that failed to load -- settles the
  // same way, or the caller would wait on media that is no longer there.
  private settlePlayback() {
    this.isPlaybackPending = false;
    const waiters = this.playbackWaiters;
    this.playbackWaiters = [];
    waiters.forEach(resolve => resolve());
  }

  // Media that fails to load never fires the event playback waits on, so the
  // stage would stay empty and the run button stay on stop. Put the theater back
  // and let the host report the failure.
  private handleMediaLoadError(type: 'video' | 'audio') {
    this.reset();
    this.onMediaLoadError?.(type);
  }

  reset() {
    this.setOutputVisible(false);
    this.resetAudioAndVideo();
  }

  onStop() {
    this.setOutputVisible(false);
    this.resetAudioAndVideo();
    // Close the photo prompter if it is still open
    this.closePhotoPrompter();
  }

  // Legacy Java Lab reads the image's visibility directly; lab2 also needs the
  // change in React so it can swap in an empty state.
  private setOutputVisible(isVisible: boolean) {
    const imageElement = this.getImgElement();
    if (imageElement) {
      imageElement.style.visibility = isVisible ? 'visible' : 'hidden';
    }
    this.onOutputVisibleChange?.(isVisible);
  }

  resetAudioAndVideo() {
    this.getAudioElement()?.pause();
    this.audioSource.clear();
    this.imageSource.clear();
    this.hasAudio = false;
    this.hasMedia = false;
    this.isVisualLoaded = false;
    this.isAudioReady = false;
    this.clearPlaybackTimer();
    this.visualDurationMs = null;
    this.isAudioPlaying = false;
    this.isVisualPlaying = false;
    this.settlePlayback();
  }

  private clearPlaybackTimer() {
    if (this.playbackTimer !== null) {
      window.clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  // Whether the program handed the theater anything to play.
  hasOutput() {
    return this.hasMedia;
  }

  getImgElement() {
    return document.getElementById(THEATER_IMAGE_ID) as HTMLImageElement | null;
  }

  getAudioElement() {
    return document.getElementById(THEATER_AUDIO_ID) as HTMLAudioElement | null;
  }

  onClose() {
    this.onNewlineMessage();
    this.onOutputMessage(
      `${STATUS_MESSAGE_PREFIX} ${javalabMsg.programCompleted()}`
    );
    this.onNewlineMessage();
    // Close the photo prompter if it is still open
    this.closePhotoPrompter();
  }

  onPhotoPrompterFileSelected(photo: Blob) {
    if (!this.prompterUploadUrl) {
      // The upload URL should be provided when opening the prompter, so if
      // it is somehow not set, we are in an invalid scenario.
      this.onJavabuilderMessage(
        InputMessageType.THEATER,
        InputMessage.UPLOAD_ERROR
      );
      return;
    }

    this.uploadFile(
      this.prompterUploadUrl,
      photo,
      () => {
        this.onJavabuilderMessage(
          InputMessageType.THEATER,
          InputMessage.UPLOAD_SUCCESS
        );
      },
      () => {
        this.onJavabuilderMessage(
          InputMessageType.THEATER,
          InputMessage.UPLOAD_ERROR
        );
      }
    );
  }

  uploadFile = (
    uploadUrl: string,
    fileData: Blob,
    onSuccess: UploadCallback,
    onError: UploadCallback
  ) => {
    // Use XHR directly (rather than ajax) so we can upload binary file data directly
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.onload = onSuccess;
    xhr.onerror = onError;

    xhr.send(fileData);
  };
}
