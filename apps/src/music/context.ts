import React from 'react';
import MusicPlayer from './player/MusicPlayer';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext = React.createContext(null);

/** Provicess access to commonly used APIs related to the playing state. */
type ExecutionInfo = {
  getIsExecutionPlay: () => boolean;
};

export const ExecutionContext: React.Context<
  ExecutionInfo
> = React.createContext<ExecutionInfo>({getIsExecutionPlay: () => false});

type PlayerUtils = Pick<
  MusicPlayer,
  | 'getPlaybackEvents'
  | 'getTracksMetadata'
  | 'getLengthForId'
  | 'getTypeForId'
  | 'getLastMeasure'
>;

/** Provides access to commonly used MusicPlayer APIs (without exposing the entire player) */
export const PlayerUtilsContext: React.Context<
  PlayerUtils
> = React.createContext<PlayerUtils>({
  getPlaybackEvents: () => [],
  getTracksMetadata: () => ({}),
  getLengthForId: () => 0,
  getTypeForId: () => null,
  getLastMeasure: () => 0
});
