import loadableComponents from 'loadable-components';
import React from 'react';

import i18n from '@cdo/locale';

import FontAwesome from '../legacySharedComponents/FontAwesome';

function Spinner() {
  return <FontAwesome icon="spinner" className="fa-pulse fa-3x" />;
}

function ExclamationTriangle() {
  return (
    <FontAwesome
      icon="exclamation-triangle"
      className="fa-2x"
      title={i18n.loadingError()}
    />
  );
}

export default function loadable(getComponent, options = {}) {
  return loadableComponents(getComponent, {
    ErrorComponent: ExclamationTriangle,
    LoadingComponent: Spinner,
    ...options,
  });
}
