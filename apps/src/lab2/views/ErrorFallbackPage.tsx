import React from 'react';

import moduleStyles from './Lab2Wrapper.module.scss';

const i18n = require('@cdo/locale');

export interface ErrorUIProps {
  message?: string;
}

export const ErrorUI: React.FunctionComponent<ErrorUIProps> = ({message}) => (
  <div id="page-error-container" className={moduleStyles.pageErrorContainer}>
    <div id="page-error" className={moduleStyles.pageError}>
      <img
        className={moduleStyles.pageErrorImage}
        src="/shared/images/sad-bee-avatar.png"
        alt=""
      />
      <div>{i18n.loadingError()}</div>
      {message && (
        <div className={moduleStyles.pageErrorMessage}>({message})</div>
      )}
    </div>
  </div>
);

export const ErrorFallbackPage = () => (
  <div id="lab-container" className={moduleStyles.labContainer}>
    <ErrorUI />
  </div>
);
