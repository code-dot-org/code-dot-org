import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import {TheaterSignalType} from '@cdo/apps/miniApps/theater/constants';

// Turns the gif bytes a student's program rendered into an object URL and hands
// it to the theater mini app. Java Lab reaches the same mini app with a signed
// S3 url; in Python Lab the gif never leaves the browser.
export function handleTheaterMedia(gif: Uint8Array<ArrayBuffer>) {
  const theater = CodebridgeRegistry.getInstance().getTheater();
  if (!theater) {
    return;
  }

  const url = URL.createObjectURL(new Blob([gif], {type: 'image/gif'}));
  theater.handleSignal({
    value: TheaterSignalType.VISUAL_URL,
    detail: {url},
  });
  // The mini app reveals the stage only after two load events, one visual and
  // one audio. Python Lab theater produces no audio track, so NO_AUDIO stands
  // in for the second event.
  theater.handleSignal({value: TheaterSignalType.NO_AUDIO, detail: {}});
}
