import React from 'react';

export const AnalyticsContext = React.createContext(null);
export const PlayerUtilsContext = React.createContext({
  getCurrentMeasure: () => 0,
  convertMeasureToSeconds: () => 0
});
export const BaseUrlContext = React.createContext('');
