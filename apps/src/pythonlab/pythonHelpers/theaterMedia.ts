import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';

import {gifDurationMs} from './gifDuration';

// Turns the media bytes a student's program rendered into object URLs and hands
// them to the theater mini app.
export function handleTheaterMedia(
  gif: Uint8Array<ArrayBuffer>,
  wav?: Uint8Array<ArrayBuffer>
) {
  const theater = CodebridgeRegistry.getInstance().getTheater();
  if (!theater) {
    return;
  }

  const gifUrl = URL.createObjectURL(new Blob([gif], {type: 'image/gif'}));
  // The theater needs the gif's length to know when playback is over; an <img>
  // will not tell it, so it is read off the bytes here.
  theater.handleSignal({
    value: TheaterSignalType.VISUAL_URL,
    detail: {url: gifUrl, durationMs: gifDurationMs(gif) ?? undefined},
  });
  // The mini app reveals the stage only after two load events, one visual and
  // one audio. A program that made no sound has no audio to wait on, so
  // NO_AUDIO stands in for the second event.
  if (wav) {
    const wavUrl = URL.createObjectURL(new Blob([wav], {type: 'audio/wav'}));
    theater.handleSignal({
      value: TheaterSignalType.AUDIO_URL,
      detail: {url: wavUrl},
    });
  } else {
    theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});
  }
}
