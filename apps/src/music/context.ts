import React from 'react';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import MusicPlayer from './player/MusicPlayer';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext: React.Context<AnalyticsReporter | null> =
  React.createContext<AnalyticsReporter | null>(null);
