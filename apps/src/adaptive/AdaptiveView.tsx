import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useMemo} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LabProps} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {AdaptiveContentError, parsePathway} from './schema';
import {AdaptiveLevelProperties} from './types';

import moduleStyles from './adaptiveView.module.scss';

const AdaptiveView: React.FunctionComponent<
  LabProps<AdaptiveLevelProperties>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  const {adaptiveId, pathway} = levelProperties;

  const parsed = useMemo(() => {
    try {
      return {pathway: parsePathway(pathway), problems: [] as string[]};
    } catch (e) {
      if (e instanceof AdaptiveContentError) {
        return {pathway: undefined, problems: e.problems};
      }
      throw e;
    }
  }, [pathway]);

  const onContinue = useCallback(() => {
    dispatch(continueOrFinishLesson());
  }, [dispatch]);

  return (
    <div className={moduleStyles.container}>
      <h1>Adaptive: {adaptiveId}</h1>
      {parsed.problems.length > 0 ? (
        <>
          <h2>Content problems</h2>
          <ul>
            {parsed.problems.map(problem => (
              <li key={problem}>
                <code>{problem}</code>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2>{parsed.pathway?.title}</h2>
          <pre className={moduleStyles.dump}>
            {JSON.stringify(parsed.pathway, null, 2)}
          </pre>
        </>
      )}
      <MuiButton variant="contained" onClick={onContinue}>
        Continue
      </MuiButton>
    </div>
  );
};

export default AdaptiveView;
