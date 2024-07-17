import javalabMsg from '@cdo/javalab/locale';

import {
  TheaterSignalType,
  STATUS_MESSAGE_PREFIX,
  InputMessageType,
  InputMessage,
} from '../constants';

export default class Theater {
  constructor(
    onOutputMessage,
    onNewlineMessage,
    openPhotoPrompter,
    closePhotoPrompter,
    onJavabuilderMessage
  ) {
    this.canvas = null;
    this.context = null;
    this.onOutputMessage = onOutputMessage;
    this.onNewlineMessage = onNewlineMessage;
    this.openPhotoPrompter = openPhotoPrompter;
    this.closePhotoPrompter = closePhotoPrompter;
    this.onJavabuilderMessage = onJavabuilderMessage;
    this.loadEventsFinished = 0;
    this.prompterUploadUrl = null;
    this.hasAudio = false;
  }

  handleSignal(data) {
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
        this.prompterUploadUrl = data.detail.uploadUrl;
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
    return document.getElementById('theater');
  }

  getAudioElement() {
    return document.getElementById('theater-audio');
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

  onPhotoPrompterFileSelected(photo) {
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
      xhr => {
        this.onJavabuilderMessage(
          InputMessageType.THEATER,
          InputMessage.UPLOAD_SUCCESS
        );
      },
      xhr => {
        this.onJavabuilderMessage(
          InputMessageType.THEATER,
          InputMessage.UPLOAD_ERROR
        );
      }
    );
  }

  uploadFile = (uploadUrl, fileData, onSuccess, onError) => {
    // Use XHR directly (rather than ajax) so we can upload binary file data directly
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.onload = onSuccess;
    xhr.onerror = onError;

    xhr.send(fileData);
  };
}
