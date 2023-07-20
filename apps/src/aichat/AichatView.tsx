// AichatView
//
// This is a React client for an aichat level.

import React from 'react';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Aichat from './Aichat';
import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import aichatLocale from './locale';
import styles from './aichat.module.scss';

const AichatView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const nextButtonPressed = () => {
    const appType = 'aichat';
    dispatch(sendSuccessReport(appType));
    dispatch(navigateToNextLevel());
  };

  return (
    <div id="aichat">
      <Aichat>
        <button
          id="aichat-continue-button"
          type="button"
          onClick={() => nextButtonPressed()}
          className={styles.buttonNext}
        >
          {aichatLocale.continue()}
        </button>
      </Aichat>
    </div>
  );
};

export default AichatView;
