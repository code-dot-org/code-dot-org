import React from 'react';
import MusicPlayer from './player/MusicPlayer';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext = React.createContext(null);

type PlayerUtils = Pick<
  MusicPlayer,
  'getPlaybackEvents' | 'getTracksMetadata' | 'getLengthForId' | 'getTypeForId'
>;

interface Other {
  getIsExecutingPlay: () => boolean
};

/** Provides access to commonly used MusicPlayer APIs (without exposing the entire player) */
export const PlayerUtilsContext: React.Context<
  PlayerUtils & Other
> = React.createContext<PlayerUtils & Other>({
  getPlaybackEvents: () => [],
  getTracksMetadata: () => ({}),
  getLengthForId: () => 0,
  getTypeForId: () => null,
  getIsExecutingPlay: () => false
});
