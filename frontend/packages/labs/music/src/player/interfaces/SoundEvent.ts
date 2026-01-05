import type {SoundType} from '../MusicLibrary';

import type {PlaybackEvent} from './PlaybackEvent';

/**
 * A playback event representing a single sound
 */
export interface SoundEvent extends PlaybackEvent {
  type: 'sound';
  soundType: SoundType;
}

export function isSoundEvent(event: PlaybackEvent): event is SoundEvent {
  return event.type === 'sound';
}
