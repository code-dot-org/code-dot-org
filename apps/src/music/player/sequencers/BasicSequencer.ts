import {PlaybackEvent} from '../interfaces/PlaybackEvent';
import {SoundEvent} from '../interfaces/SoundEvent';
import MusicLibrary from '../MusicLibrary';
import Sequencer from './Sequencer';

export default class BasicSequencer extends Sequencer {
  private library: MusicLibrary | null;
  private playbackEvents: PlaybackEvent[];

  constructor() {
    super();
    this.library = null;
    this.playbackEvents = [];
  }

  setLibrary(library: MusicLibrary): void {
    this.library = library;
  }

  playSoundAtMeasureById(id: string, measure: number, insideWhenRun: boolean) {
    const soundEvent: SoundEvent = {
      type: 'sound',
      id,
      when: measure,
      triggered: !insideWhenRun,
      length: this.getLengthForId(id)
    };

    this.playbackEvents.push(soundEvent);
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return this.playbackEvents;
  }

  reset(): void {
    this.playbackEvents = [];
  }

  private getLengthForId(id: string): number {
    if (this.library === null) {
      return 0;
    }

    const soundData = this.library.getSoundForId(id);
    return soundData ? soundData.length : 0;
  }
}
