import React from 'react';
import AnalyticsReporter from './analytics/AnalyticsReporter';

/** Provides access to the Analytics reporter object */
export const AnalyticsContext: React.Context<AnalyticsReporter | null> =
  React.createContext<AnalyticsReporter | null>(null);
