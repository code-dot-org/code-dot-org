// AichatView
//
// This is a React client for an aichat level.  Note that this is
// only used for levels that use Lab2.  For levels that don't use Lab2,
// they will get an older-style level implemented with a HAML page and some
// non-React JS code.

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
