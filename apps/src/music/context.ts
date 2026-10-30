import React from 'react';

import MusicAnalyticsReporter from './analytics/AnalyticsReporter';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext: React.Context<MusicAnalyticsReporter | null> =
  React.createContext<MusicAnalyticsReporter | null>(null);
