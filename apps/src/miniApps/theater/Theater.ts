import {
  STATUS_MESSAGE_PREFIX,
  InputMessageType,
} from '@cdo/apps/javalab/constants';
import javalabMsg from '@cdo/apps/javalab/locale';

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

export default class Theater {
  private readonly onOutputMessage: (message: string) => void;
  private readonly onNewlineMessage: () => void;
  private readonly openPhotoPrompter: (prompt?: string) => void;
  private readonly closePhotoPrompter: () => void;
  private readonly onJavabuilderMessage: (
    messageType: string,
    message: InputMessage
  ) => void;
  private loadEventsFinished: number;
  private prompterUploadUrl: string | null;
  private hasAudio: boolean;

  constructor(
    onOutputMessage: (message: string) => void,
    onNewlineMessage: () => void,
    openPhotoPrompter: (prompt?: string) => void,
    closePhotoPrompter: () => void,
    onJavabuilderMessage: (messageType: string, message: InputMessage) => void
  ) {
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.openPhotoPrompter = openPhotoPrompter;
    this.closePhotoPrompter = closePhotoPrompter;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.loadEventsFinished = 0;
    this.prompterUploadUrl = null;
    this.hasAudio = false;
  }

  handleSignal(data: TheaterSignal) {
    switch (data.value) {
      case TheaterSignalType.AUDIO_URL: {
        // Wait for the audio to load before starting playback
        this.hasAudio = true;
        this.getAudioElement().src =
          data.detail.url + this.getCacheBustSuffix();
        this.getAudioElement().oncanplaythrough = () => this.startPlayback();
        break;
      }
      case TheaterSignalType.VISUAL_URL: {
        // Preload the image. Once it's ready, start the playback
        this.getImgElement().src = data.detail.url + this.getCacheBustSuffix();
        this.getImgElement().onload = () => this.startPlayback();
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
      this.getImgElement().style.visibility = 'visible';
      if (this.hasAudio) {
        this.getAudioElement().play();
      }
    }
  }

  reset() {
    this.loadEventsFinished = 0;
    this.getImgElement().style.visibility = 'hidden';
    this.resetAudioAndVideo();
  }

  onStop() {
    this.resetAudioAndVideo();
    // Close the photo prompter if it is still open
    this.closePhotoPrompter();
  }

  resetAudioAndVideo() {
    const audioElement = this.getAudioElement();
    audioElement.pause();
    audioElement.src = '';
    this.getImgElement().src = '';
    this.hasAudio = false;
  }

  getImgElement() {
    return document.getElementById(THEATER_IMAGE_ID) as HTMLImageElement;
  }

  getAudioElement() {
    return document.getElementById(THEATER_AUDIO_ID) as HTMLAudioElement;
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

  getCacheBustSuffix() {
    return '?=' + new Date().getTime();
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
