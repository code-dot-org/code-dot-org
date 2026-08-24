import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';

// Turns the media bytes a student's program rendered into object URLs and hands
// them to the theater mini app.
export function handleTheaterMedia(
  gif: Uint8Array<ArrayBuffer>,
  wav?: Uint8Array<ArrayBuffer>,
  gifDurationMs?: number
) {
  const theater = CodebridgeRegistry.getInstance().getTheater();
  if (!theater) {
    return;
  }

  const gifUrl = URL.createObjectURL(new Blob([gif], {type: 'image/gif'}));
  // The gif's length comes from the theater package, which knows the frame
  // delays it rendered; an <img> reports nothing about the animation it plays.
  theater.handleSignal({
    value: TheaterSignalType.VISUAL_URL,
    detail: {url: gifUrl, durationMs: gifDurationMs},
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
