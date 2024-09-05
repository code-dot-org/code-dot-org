import {PlaybackEvent} from '../interfaces/PlaybackEvent';

/**
 * Sequences {@link PlaybackEvent}s in the user's project. The
 * various implementations of this class are used by different
 * block modes (i.e. programming models) we currently support.
 */
export default abstract class Sequencer {
  /**
   * Return a list of sequenced {@link PlaybackEvent}s
   */
  abstract getPlaybackEvents(): PlaybackEvent[];
  /**
   * Clear all sequenced events.
   */
  abstract clear(): void;
  /**
   * Return the last sequenced measure.
   */
  abstract getLastMeasure(): number;

  abstract getHandlers(): any;
}
