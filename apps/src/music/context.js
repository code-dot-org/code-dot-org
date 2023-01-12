import React from 'react';

export const AnalyticsContext = React.createContext(null);
export const PlayerUtilsContext = React.createContext({
  getSoundEvents: () => [],
  getCurrentMeasure: () => 0,
  convertMeasureToSeconds: () => 0,
  getTracksMetadata: () => {}
});
