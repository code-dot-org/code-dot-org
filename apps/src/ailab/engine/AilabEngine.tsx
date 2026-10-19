import React, {useEffect, useRef} from 'react';
import {Provider} from 'react-redux';

import App, {type AppProps} from './App';
import {setAssetPath} from './assetPath';
import {setMetricsLogger} from './helpers/metrics';
import I18n from './i18n';
import {loadLevel} from './levelLoad';
import {ProjectProvider} from './ProjectContext';
import {setInstructionsEnabled} from './redux';
import {store} from './store';
import {TrainingDataProvider} from './TrainingDataContext';
import type {Mode} from './types';

export interface AilabEngineProps extends AppProps {
  /** Base path the consumer serves the lab's datasets/images from. */
  assetPath: string;
  /**
   * Each method returns the locale relevant string to display. If undefined,
   * English strings are used.
   */
  i18n?: Record<string, string>;
  logMetric?: (eventName: string, details: Record<string, unknown>) => void;
  mode?: Mode;
  /** Reloads the lab when it changes; the lab stays mounted across levels. */
  levelId?: string | number;
}

/**
 * The lab, under the providers its components expect. The Redux store is a
 * module singleton, so only one of these can be mounted at a time.
 */
const AilabEngine = ({
  assetPath,
  i18n,
  logMetric,
  mode,
  levelId,
  ...appProps
}: AilabEngineProps) => {
  // At render time rather than in an effect: the components below read the
  // asset path and I18n.t as they first render, before any effect runs.
  const initialized = useRef(false);
  if (!initialized.current) {
    initialized.current = true;
    setAssetPath(assetPath);
    I18n.initI18n(i18n);
    if (logMetric) {
      setMetricsLogger(logMetric);
    }
    store.dispatch(setInstructionsEnabled(!!appProps.setInstructionsKey));
  }

  useEffect(() => {
    loadLevel(mode);
  }, [levelId, mode]);

  return (
    <Provider store={store}>
      <ProjectProvider>
        <TrainingDataProvider>
          <App {...appProps} />
        </TrainingDataProvider>
      </ProjectProvider>
    </Provider>
  );
};

export default AilabEngine;
