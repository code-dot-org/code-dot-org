import {ChordEvent} from './ChordEvent';
import {PatternEvent} from './PatternEvent';
import {PlaybackEvent} from './PlaybackEvent';
import {TuneEvent} from './TuneEvent';

export function hasInstrument(
  event: PlaybackEvent
): event is ChordEvent | TuneEvent | PatternEvent {
  return 'instrument' in event;
}
