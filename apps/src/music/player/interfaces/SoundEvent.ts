import { SoundType } from '../MusicLibrary';
import {PlaybackEvent} from './PlaybackEvent';

/**
 * A playback event representing a single sound
 */
export interface SoundEvent extends PlaybackEvent {
  type: 'sound';
  id: string;
  soundType: SoundType;
}
