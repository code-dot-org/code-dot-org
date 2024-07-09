import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import React from 'react';

import {navigateToNextLevel} from '@cdo/apps/code-studio/progressRedux';
import {nextLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import Button from '@cdo/apps/componentLibrary/button';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {useFetch} from '@cdo/apps/util/useFetch';

import moduleStyles from './control-buttons.module.scss';

interface PermissionResponse {
  permissions: string[];
}

const ControlButtons: React.FunctionComponent = () => {
  const {onRun} = useCodebridgeContext();
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const dispatch = useAppDispatch();

  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const hasNextLevel = useAppSelector(
    state => nextLevelId(state) !== undefined
  );
  const hasPredictResponse = useAppSelector(
    state => !!state.predictLevel.response
  );
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  // const isSubmittable = useAppSelector(
  //   state => state.lab.levelProperties?.submittable
  // );
  const disableRunAndTest = loading || (isPredictLevel && !hasPredictResponse);

  const navigationButtonText = hasNextLevel
    ? commonI18n.continue()
    : commonI18n.finish();

  const onContinue = () => dispatch(navigateToNextLevel());
  // No-op for now. TODO: figure out what the finish button should do.
  // https://codedotorg.atlassian.net/browse/CT-664
  const onFinish = () => {};

  const handleRun = (runTests: boolean) => {
    if (onRun) {
      const parsedPermissions = data
        ? (data as PermissionResponse)
        : {permissions: []};
      onRun(runTests, dispatch, parsedPermissions.permissions, source);
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code."));
    }
  };

  return (
    <div className={moduleStyles.controlButtonsContainer}>
      <Button
        text="Run"
        onClick={() => handleRun(false)}
        disabled={disableRunAndTest}
        iconLeft={{iconStyle: 'solid', iconName: 'play'}}
        className={moduleStyles.firstControlButton}
        size={'s'}
        color={'white'}
      />
      <Button
        text="Test"
        onClick={() => handleRun(true)}
        disabled={disableRunAndTest}
        iconLeft={{iconStyle: 'solid', iconName: 'flask'}}
        color={'black'}
        size={'s'}
      />
      <Button
        text={navigationButtonText}
        onClick={hasNextLevel ? onContinue : onFinish}
        disabled={loading}
        color={'purple'}
        className={moduleStyles.navigationButton}
        size={'s'}
        iconLeft={
          hasNextLevel
            ? {iconStyle: 'solid', iconName: 'arrow-right'}
            : undefined
        }
      />
    </div>
  );
};

export default ControlButtons;
