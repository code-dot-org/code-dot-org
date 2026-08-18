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
  };
}

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
      element.src = '';
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
  private loadEventsFinished: number;
  private prompterUploadUrl: string | null;
  private hasAudio: boolean;
  private readonly imageSource: TrackedSource;
  private readonly audioSource: TrackedSource;

  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    openPhotoPrompter: (prompt?: string) => void,
    closePhotoPrompter: () => void,
    onJavabuilderMessage: (messageType: string, message: InputMessage) => void,
    onOutputVisibleChange?: (isVisible: boolean) => void
  ) {
    super();
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.openPhotoPrompter = openPhotoPrompter;
    this.closePhotoPrompter = closePhotoPrompter;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.onOutputVisibleChange = onOutputVisibleChange;
    this.loadEventsFinished = 0;
    this.prompterUploadUrl = null;
    this.hasAudio = false;
    this.imageSource = new TrackedSource(() => this.getImgElement());
    this.audioSource = new TrackedSource(() => this.getAudioElement());
  }

  handleSignal(data: TheaterSignal) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        // Wait for the audio to load before starting playback
        this.hasAudio = true;
        this.audioSource.set(data.detail.url);
        const audioElement = this.getAudioElement();
        if (audioElement) {
          audioElement.oncanplaythrough = () => this.startPlayback();
        }
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        // Preload the image. Once it's ready, start the playback
        this.imageSource.set(data.detail.url);
        const imageElement = this.getImgElement();
        if (imageElement) {
          imageElement.onload = () => this.startPlayback();
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
        // there is no audio associated with the video, trigger startPlayback so we don't wait for the audio file
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
    // We expect exactly 2 responses from Javabuilder. One for audio (or the NO_AUDIO signal) and one for video.
    // Wait for both to respond and load before starting playback.
    if (this.loadEventsFinished > 1) {
      this.setOutputVisible(true);
      if (this.hasAudio) {
        this.getAudioElement()?.play();
      }
    }
  }

  reset() {
    this.loadEventsFinished = 0;
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
  }

  getImgElement() {
    return document.getElementById(
      THEATER_IMAGE_ID
    ) as HTMLImageElement | null;
  }

  getAudioElement() {
    return document.getElementById(
      THEATER_AUDIO_ID
    ) as HTMLAudioElement | null;
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
