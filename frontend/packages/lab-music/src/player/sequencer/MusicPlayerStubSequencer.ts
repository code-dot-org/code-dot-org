import {PlaybackEvent} from '../interfaces/PlaybackEvent';

import Sequencer from './Sequencer';

/**
 * A stubbed out version of {@link Sequencer} meant to be used by block
 * modes that use the MusicPlayer API. This allows us to migrate block modes
 * over to using the Sequencer model as we like, without completely crashing
 * if a block mode does not yet have a sequencer implementation.
 */
export default class MusicPlayerStubSequencer extends Sequencer {
  playSoundAtMeasureById() {
    console.log('Not implemented');
  }

  createTrack() {
    console.log('Not implemented');
  }

  addSoundsToTrack() {
    console.log('Not implemented');
  }

  addRestToTrack() {
    console.log('Not implemented');
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return [];
  }

  clear(): void {
    // no-op;
  }

  getLastMeasure(): number {
    return 0;
  }
}
