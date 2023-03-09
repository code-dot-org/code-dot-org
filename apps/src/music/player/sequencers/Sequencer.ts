import { PlaybackEvent } from '../MusicPlayer';
import {SampleEvent} from '../SamplePlayer';

export default abstract class Sequencer {
  abstract getPlaybackEvents(): PlaybackEvent[];
  abstract reset(): void;
}
