import React, {useRef} from 'react';

import App, {type AppProps} from './App';
import {setAssetPath} from './assetPath';
import {setMetricsLogger} from './helpers/metrics';
import I18n from './i18n';
import {setInstructionsEnabled} from './redux';
import {store} from './store';

export interface AilabEngineProps extends AppProps {
  /** Base path the consumer serves the lab's datasets/images from. */
  assetPath: string;
  i18n?: Record<string, string>;
  logMetric?: (eventName: string, details: Record<string, unknown>) => void;
}

const AilabEngine = ({
  assetPath,
  i18n,
  logMetric,
  ...appProps
}: AilabEngineProps) => {
  // At render time rather than in an effect: the components below read the
  // asset path and I18n.t as they first render, and the host's level load
  // reads the asset path from its own layout effect.
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

  return <App {...appProps} />;
};

export default AilabEngine;
