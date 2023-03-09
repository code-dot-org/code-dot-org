import {PlaybackEvent} from './player/MusicPlayer';

/**
 * This should all just be done in Redux -
 *
 * playbackEvents would be part of state
 * add/clear functions would be actions
 * getPlaybackEvents would be reading state
 *
 */
export default class PlaybackUIEventManager {
  private playbackEvents: PlaybackEvent[];

  constructor() {
    this.playbackEvents = [];
  }

  addNewEvents(newEvents: PlaybackEvent[]) {
    this.playbackEvents.push(...newEvents);
  }

  clearWhenRunEvents() {
    this.playbackEvents = this.playbackEvents.filter(
      playbackEvent => playbackEvent.triggered
    );
  }

  clearTriggeredEvents() {
    this.playbackEvents = this.playbackEvents.filter(
      playbackEvent => !playbackEvent.triggered
    );
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return this.playbackEvents;
  }
}
