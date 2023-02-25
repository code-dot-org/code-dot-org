import React from 'react';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import MusicPlayer from './player/MusicPlayer';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext: React.Context<AnalyticsReporter | null> = React.createContext<AnalyticsReporter | null>(
  null
);

type PlayerUtils = Pick<
  MusicPlayer,
  'getPlaybackEvents' | 'getTracksMetadata' | 'getLengthForId' | 'getTypeForId'
>;

/** Provides access to commonly used MusicPlayer APIs (without exposing the entire player) */
export const PlayerUtilsContext: React.Context<
  PlayerUtils
> = React.createContext<PlayerUtils>({
  getPlaybackEvents: () => [],
  getTracksMetadata: () => ({}),
  getLengthForId: () => 0,
  getTypeForId: () => null
});
