import {Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LabProps} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {AdaptiveLevelProperties} from './types';

import moduleStyles from './adaptiveView.module.scss';

// Placeholder Adaptive view
const AdaptiveView: React.FunctionComponent<
  LabProps<AdaptiveLevelProperties>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  const {adaptiveId, adaptiveContent} = levelProperties;

  const onContinue = useCallback(() => {
    dispatch(continueOrFinishLesson());
  }, [dispatch]);

  return (
    <div className={moduleStyles.container}>
      <h1>Adaptive: {adaptiveId}</h1>
      <h2>Content</h2>
      <pre className={moduleStyles.dump}>
        {JSON.stringify(adaptiveContent, null, 2)}
      </pre>
      <MuiButton variant="contained" onClick={onContinue}>
        Continue
      </MuiButton>
    </div>
  );
};

export default AdaptiveView;
