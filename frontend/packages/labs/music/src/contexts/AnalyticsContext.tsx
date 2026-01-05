'use client';

import type {PropsWithChildren} from 'react';
import React, {createContext} from 'react';
import LabMusicMetricsReporter from '../LabMusicMetricsReporter';

const AnalyticsContext = createContext<LabMusicMetricsReporter | null>(null);

/**
 * This keeps track of the current analytics reporter.
 */
export const AnalyticsProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  return (
    <AnalyticsContext.Provider value={null}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext;
