import {Effects} from './Effects';
import {FunctionContext} from './FunctionContext';
import {SkipContext} from './SkipContext';

export interface PlaybackEvent {
  /** Type of event */
  type: 'sound' | 'pattern' | 'chord' | 'tune';
  /** Measure when this event occurs */
  when: number;
  /** Whether this event was triggered or scheduled via standard playback */
  triggered: boolean;
  /** ID of the track this event belongs to (only used in Tracks mode) */
  trackId?: string;
  /** Function context this event belongs to (only used in Simple2 mode) */
  functionContext?: FunctionContext;
  /** Skip context for this event (whether it is skippable and is currently being skipped) */
  skipContext?: SkipContext;
  /** Effects applied to this event */
  effects?: Effects;
  /** length of the event in measures */
  length: number;
  /** The ID of the block that created this event */
  blockId: string;
  /** A unique ID used to group same sounds together in the timeline */
  id: string;
}
