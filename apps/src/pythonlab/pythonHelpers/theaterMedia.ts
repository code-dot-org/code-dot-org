import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import {
  CAPTION_ENABLED_ENDPOINT,
  CAPTION_ENDPOINT,
  CAPTION_WAIT_MS,
  TheaterSignalType,
} from '@cdo/apps/miniApps/theater/constants';
import Theater, {TheaterSignal} from '@cdo/apps/miniApps/theater/Theater';
import HttpClient from '@cdo/apps/util/HttpClient';

// Turns the media bytes a student's program rendered into object URLs and hands
// them to the theater mini app.
export function handleTheaterMedia(
  gif: Uint8Array<ArrayBuffer>,
  wav?: Uint8Array<ArrayBuffer>,
  gifDurationMs?: number,
  summary?: string,
  transcript?: string,
  still?: Uint8Array<ArrayBuffer>
) {
  const theater = CodebridgeRegistry.getInstance().getTheater();
  if (!theater) {
    return;
  }

  // Before the media, so the description does not wait on an image decode.
  if (summary) {
    theater.handleSignal({
      value: TheaterSignalType.DESCRIPTION,
      detail: {summary, transcript},
    });
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

  if (summary) {
    void requestCaption(still, theater);
  }
}

// Asked once per page.
let captioningEnabled: Promise<boolean> | null = null;

function isCaptioningEnabled(): Promise<boolean> {
  captioningEnabled ??= HttpClient.get(CAPTION_ENABLED_ENDPOINT, true)
    .then(response => response.json())
    .then(body => body.enabled === true)
    .catch(() => false);
  return captioningEnabled;
}

// Every failure ends in NO_CAPTION, or the held transcript is never read.
async function requestCaption(
  still: Uint8Array<ArrayBuffer> | undefined,
  theater: Theater
) {
  // Read before any await, so the answer matches the scene it was asked about.
  const generation = theater.getDescriptionGeneration();

  // First answer wins, or a late caption would follow the transcript.
  let answered = false;
  const answer = (signal: TheaterSignal) => {
    if (answered) {
      return;
    }
    answered = true;
    theater.handleSignal(signal);
  };
  const giveUp = () =>
    answer({value: TheaterSignalType.NO_CAPTION, detail: {generation}});

  if (!still) {
    giveUp();
    return;
  }

  const deadline = window.setTimeout(giveUp, CAPTION_WAIT_MS);
  try {
    // With captioning off, the student's work must not leave the browser.
    if (!(await isCaptioningEnabled())) {
      giveUp();
      return;
    }
    const response = await HttpClient.post(
      CAPTION_ENDPOINT,
      new Blob([still], {type: 'image/png'}),
      true,
      {'Content-Type': 'image/png'}
    );
    const {caption} = await response.json();
    if (typeof caption === 'string' && caption.trim()) {
      answer({value: TheaterSignalType.CAPTION, detail: {caption, generation}});
    } else {
      // No caption, or one below the server's confidence floor.
      giveUp();
    }
  } catch {
    giveUp();
  } finally {
    window.clearTimeout(deadline);
  }
}
