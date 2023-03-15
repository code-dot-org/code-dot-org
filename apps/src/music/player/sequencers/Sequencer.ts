import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import MusicLibrary from '../MusicLibrary';

export default abstract class Sequencer {
  abstract setLibrary(library: MusicLibrary): void;
  abstract getPlaybackEvents(): PlaybackEvent[];
  abstract reset(): void;
}
