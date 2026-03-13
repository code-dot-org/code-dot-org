import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import moduleStyles from './Lab2Wrapper.module.scss';

const i18n = require('@cdo/locale');

export interface ErrorUIProps {
  message?: string;
}

export const ErrorUI: React.FunctionComponent<ErrorUIProps> = ({message}) => (
  <div id="page-error-container" className={moduleStyles.pageErrorContainer}>
    <div data-theme="Light" id="page-error" className={moduleStyles.pageError}>
      <img
        className={moduleStyles.pageErrorImage}
        src="/shared/images/sad-bee-avatar.png"
        alt=""
      />
      <div>{i18n.loadingError()}</div>
      {message && (
        <div className={moduleStyles.pageErrorMessage}>({message})</div>
      )}
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        onClick={() => {
          location.reload();
        }}
        type="button"
      >
        {commonI18n.reloadPage()}
      </MuiButton>
    </div>
  </div>
);

export const ErrorFallbackPage = () => (
  <div id="lab-container" className={moduleStyles.labContainer}>
    <ErrorUI />
  </div>
);
