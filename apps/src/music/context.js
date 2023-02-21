import React from 'react';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext = React.createContext(null);

/** Provides access to commonly used MusicPlayer APIs (without exposing the entire player) */
export const PlayerUtilsContext = React.createContext({
  getSoundEvents: () => [],
  convertMeasureToSeconds: () => 0,
  getTracksMetadata: () => {},
  getLengthForId: () => 0,
  getTypeForId: () => ''
});
