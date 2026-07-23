import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';

// Tracks the object URLs we hand to the theater so they can be released on the
// next run; a blob URL leaks until explicitly revoked.
let previousVisualUrl: string | null = null;
let previousAudioUrl: string | null = null;

function revokePreviousUrls() {
  if (previousVisualUrl) {
    URL.revokeObjectURL(previousVisualUrl);
    previousVisualUrl = null;
  }
  if (previousAudioUrl) {
    URL.revokeObjectURL(previousAudioUrl);
    previousAudioUrl = null;
  }
}

// Turns the raw gif/audio bytes from Python into blob object URLs and drives the
// shared theater mini-app. The mini-app reveals the image only after it has seen
// two load events, so we always send a visual signal plus either an audio signal
// or NO_AUDIO. Shared by both the same-domain and sandbox worker managers.
export function handleTheaterMedia(gif: Uint8Array, audio: Uint8Array | null) {
  const theater = CodebridgeRegistry.getInstance().getTheater();
  if (!theater) {
    return;
  }
  revokePreviousUrls();

  const visualUrl = URL.createObjectURL(
    new Blob([gif as BlobPart], {type: 'image/gif'})
  );
  previousVisualUrl = visualUrl;
  theater.handleSignal({
    value: TheaterSignalType.VISUAL_URL,
    detail: {url: visualUrl},
  });

  if (audio) {
    const audioUrl = URL.createObjectURL(
      new Blob([audio as BlobPart], {type: 'audio/wav'})
    );
    previousAudioUrl = audioUrl;
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: audioUrl},
    });
  } else {
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});
  }
}
