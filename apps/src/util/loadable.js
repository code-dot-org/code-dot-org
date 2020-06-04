import React from 'react';
import FontAwesome from '../templates/FontAwesome';
import loadableComponents from 'loadable-components';
import i18n from '@cdo/locale';

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
    ...options
  });
}
