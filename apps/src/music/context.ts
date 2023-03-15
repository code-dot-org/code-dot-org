import React from 'react';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import PlaybackUIEventManager from './PlaybackUIEventManager';
import MusicPlayer from './player/MusicPlayer';
import Sequencer from './player/sequencers/Sequencer';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext: React.Context<AnalyticsReporter | null> = React.createContext<AnalyticsReporter | null>(
  null
);

/** Provicess access to commonly used APIs related to the playing state. */
type PlayingInfo = {
  isPlaying: boolean;
};

export const PlayingContext: React.Context<PlayingInfo> = React.createContext<
  PlayingInfo
>({isPlaying: false});

type PlayerUtils = Pick<MusicPlayer, 'getTracksMetadata' | 'getLastMeasure'> &
  Pick<PlaybackUIEventManager, 'getPlaybackEvents'>;

/** Provides access to commonly used MusicPlayer APIs (without exposing the entire player) */
export const PlayerUtilsContext: React.Context<
  PlayerUtils
> = React.createContext<PlayerUtils>({
  getPlaybackEvents: () => [],
  getTracksMetadata: () => ({}),
  getLastMeasure: () => 0
});
