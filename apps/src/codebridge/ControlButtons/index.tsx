import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import React, {useContext, useState} from 'react';

import {
  navigateToNextLevel,
  sendSubmitReport,
} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import Button from '@cdo/apps/componentLibrary/button';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  DialogContext,
  DialogType,
} from '@cdo/apps/lab2/views/dialogs/DialogManager';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {useFetch} from '@cdo/apps/util/useFetch';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './control-buttons.module.scss';

interface PermissionResponse {
  permissions: string[];
}

const ControlButtons: React.FunctionComponent = () => {
  const {onRun} = useCodebridgeContext();
  const dialogControl = useContext(DialogContext);
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const [hasRun, setHasRun] = useState(false);
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
  const isSubmittable = useAppSelector(
    state => state.lab.levelProperties?.submittable
  );
  const appType = useAppSelector(state => state.lab.levelProperties?.appName);
  const hasSubmitted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.submitted
  );
  const disableRunAndTest = loading || (isPredictLevel && !hasPredictResponse);

  const onContinue = () => dispatch(navigateToNextLevel());
  // No-op for now. TODO: figure out what the finish button should do.
  // https://codedotorg.atlassian.net/browse/CT-664
  const onFinish = () => {};

  const onSubmit = () => {
    const dialogTitle = hasSubmitted
      ? commonI18n.unsubmitYourProject()
      : commonI18n.submitYourProject();
    const dialogMessage = hasSubmitted
      ? commonI18n.unsubmitYourProjectConfirm()
      : commonI18n.submitYourProjectConfirm();
    dialogControl?.showDialog(
      DialogType.GenericConfirmation,
      handleSubmit,
      dialogTitle,
      dialogMessage
    );
  };

  const handleSubmit = () => {
    dispatch(
      sendSubmitReport({appType: appType || '', submitted: !hasSubmitted})
    );
    // Go to the next level if we have one and we just submitted.
    // TODO: If onContinue starts to update progress, make sure we don't override the submitted status.
    if (hasNextLevel && !hasSubmitted) {
      onContinue();
    }
  };

  const handleRun = (runTests: boolean) => {
    if (onRun) {
      const parsedPermissions = data
        ? (data as PermissionResponse)
        : {permissions: []};
      onRun(runTests, dispatch, parsedPermissions.permissions, source);
      setHasRun(true);
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code."));
    }
  };

  // We disabled navigation is we are still loading, or if this is a submittable level,
  // the user has not submitted yet, and the user has not run their code during this session.
  const disableNavigation =
    loading || (isSubmittable && !hasSubmitted && !hasRun);
  const getNavigationButtonProps = () => {
    if (isSubmittable) {
      return {
        navigationText: hasSubmitted
          ? commonI18n.unsubmit()
          : commonI18n.submit(),
        handleNavigation: onSubmit,
      };
    } else if (hasNextLevel) {
      return {
        navigationText: commonI18n.continue(),
        handleNavigation: onContinue,
      };
    } else {
      return {navigationText: commonI18n.finish(), handleNavigation: onFinish};
    }
  };

  const {navigationText, handleNavigation} = getNavigationButtonProps();

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
        text={navigationText}
        onClick={handleNavigation}
        disabled={disableNavigation}
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
