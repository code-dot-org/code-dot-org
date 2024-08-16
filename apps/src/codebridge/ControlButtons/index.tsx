import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {
  navigateToNextLevel,
  sendSubmitReport,
} from '@cdo/apps/code-studio/progressRedux';
import {
  getCurrentLevel,
  nextLevelId,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button from '@cdo/apps/componentLibrary/button';
import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './control-buttons.module.scss';

const ControlButtons: React.FunctionComponent = () => {
  const {onRun, onStop} = useCodebridgeContext();

  const dialogControl = useDialogControl();
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
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
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isLoadingEnvironment = useAppSelector(
    state => state.lab2System.loadingCodeEnvironment
  );
  const validationState = useAppSelector(state => state.lab.validationState);
  const lifecycleNotifier = Lab2Registry.getInstance().getLifecycleNotifier();

  // We disable the run button in predict levels if we are not in start mode
  // and the user has not yet written a prediction.
  const awaitingPredictSubmit =
    !isStartMode && isPredictLevel && !hasPredictResponse;
  const disableRunAndTest = awaitingPredictSubmit || isLoadingEnvironment;

  // We disabled navigation for the following cases:
  // If this level has validation and the validation has not yet passed.
  // OR if there is no validation and the user has not run their code yet.
  // The exception to this is if this is a submittable level and the user has already submitted.
  // In that case "navigation" is unsubmitting their project and we want it to be enabled no matter
  // the run state.
  const validationHasNotPassed =
    validationState.hasConditions && !validationState.satisfied;
  const disableNavigation =
    !hasSubmitted && (validationHasNotPassed || !hasRun);

  const resetStatus = () => {
    setHasRun(false);
    setIsRunning(false);
  };

  useEffect(() => {
    // Reset run status when the level changes.
    lifecycleNotifier.addListener(
      LifecycleEvent.LevelLoadCompleted,
      resetStatus
    );
  }, [lifecycleNotifier]);

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
    dialogControl?.showDialog({
      type: DialogType.GenericConfirmation,
      handleConfirm: handleSubmit,
      title: dialogTitle,
      message: dialogMessage,
    });
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
      setIsRunning(true);
      onRun(runTests, dispatch, source).then(() => setIsRunning(false));
      if (!runTests) {
        setHasRun(true);
      }
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code."));
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
      setIsRunning(false);
    } else {
      dispatch(appendSystemMessage("We don't know how to stop your code."));
      setIsRunning(false);
    }
  };

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

  const getRunTestTooltip = () => {
    let runTestTooltip = null;
    if (awaitingPredictSubmit) {
      runTestTooltip = codebridgeI18n.predictRunDisabledTooltip();
    } else if (isLoadingEnvironment) {
      runTestTooltip = codebridgeI18n.loadingEnvironmentTooltip();
    }
    return runTestTooltip;
  };

  const getNavigationTooltip = () => {
    if (!disableNavigation) {
      return null;
    }
    if (isSubmittable) {
      // If the level is submittable, they need to pass validation if it exists,
      // otherwise they need to run their code.
      return validationHasNotPassed
        ? codebridgeI18n.validationNotYetPassedSubmit()
        : codebridgeI18n.runToSubmit();
    } else if (validationHasNotPassed) {
      // If we have a next level, show the continue text, otherwise show the finish text.
      return hasNextLevel
        ? codebridgeI18n.validationNotYetPassedContinue()
        : codebridgeI18n.validationNotYetPassedFinish();
    } else if (!hasRun) {
      return hasNextLevel
        ? codebridgeI18n.runToContinue()
        : codebridgeI18n.runToFinish();
    }
  };

  const runTestTooltip = getRunTestTooltip();
  const navigationTooltip = getNavigationTooltip();

  const renderDisabledButtonHelperIcon = (
    iconName: string,
    tooltipId: string,
    helpText: string
  ) => {
    return (
      <WithTooltip
        tooltipProps={{
          direction: 'onLeft',
          text: helpText,
          tooltipId: tooltipId,
          size: 's',
        }}
      >
        <i
          className={classNames('fa', iconName, moduleStyles.disabledInfoIcon)}
        />
      </WithTooltip>
    );
  };

  const {navigationText, handleNavigation} = getNavigationButtonProps();

  return (
    <div className={moduleStyles.controlButtonsContainer}>
      {isRunning ? (
        <Button
          text={'Stop'}
          onClick={handleStop}
          color={'destructive'}
          iconLeft={{iconStyle: 'solid', iconName: 'square'}}
          className={moduleStyles.centerButton}
          size={'s'}
        />
      ) : (
        <span className={moduleStyles.centerButton}>
          {runTestTooltip &&
            renderDisabledButtonHelperIcon(
              'fa-spinner fa-spin',
              'runTestTooltip',
              runTestTooltip
            )}
          <Button
            text={'Run'}
            onClick={() => handleRun(false)}
            disabled={disableRunAndTest}
            iconLeft={{iconStyle: 'solid', iconName: 'play'}}
            className={moduleStyles.runButton}
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
        </span>
      )}
      <span className={moduleStyles.navigationButton}>
        {navigationTooltip &&
          renderDisabledButtonHelperIcon(
            'fa-question-circle-o',
            'submitButtonDisabled',
            navigationTooltip
          )}
        <Button
          text={navigationText}
          onClick={handleNavigation}
          disabled={disableNavigation}
          color={'purple'}
          size={'s'}
          iconLeft={
            hasNextLevel
              ? {iconStyle: 'solid', iconName: 'arrow-right'}
              : undefined
          }
        />
      </span>
    </div>
  );
};

export default ControlButtons;
