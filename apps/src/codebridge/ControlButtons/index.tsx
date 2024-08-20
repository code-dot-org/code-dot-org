import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import classNames from 'classnames';
import React, {useEffect} from 'react';

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
import {setHasRun, setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
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
  const dispatch = useAppDispatch();

  const hasRun = useAppSelector(state => state.lab2System.hasRun);

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
  const isRunning = useAppSelector(state => state.lab2System.isRunning);

  const validationState = useAppSelector(state => state.lab.validationState);
  const lifecycleNotifier = Lab2Registry.getInstance().getLifecycleNotifier();

  useEffect(() => {
    const resetStatus = () => {
      dispatch(setHasRun(false));
      dispatch(setIsRunning(false));
    };

    // Reset run status when the level changes.
    lifecycleNotifier.addListener(
      LifecycleEvent.LevelLoadCompleted,
      resetStatus
    );
  }, [lifecycleNotifier, dispatch]);

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
      dispatch(setIsRunning(true));
      onRun(runTests, dispatch, source).finally(() =>
        dispatch(setIsRunning(false))
      );
      if (!runTests) {
        dispatch(setHasRun(true));
      }
    } else {
      dispatch(appendSystemMessage("We don't know how to run your code."));
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
      dispatch(setIsRunning(false));
    } else {
      dispatch(appendSystemMessage("We don't know how to stop your code."));
      dispatch(setIsRunning(false));
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

  // This method returns null if navigation is enabled, otherwise it returns the help tooltip text
  // to explain why navigation is disabled.
  // We disable navigation for the following cases:
  // If this level has validation and the validation has not yet passed.
  // OR if there is no validation and the user has not run their code yet.
  // The exception to this is if this is a submittable level and the user has already submitted.
  // In that case "navigation" is unsubmitting their project and we want it to be enabled no matter
  // the run state.
  const getDisabledNavigationTooltip = () => {
    const hasValidationAndHasNotPassed =
      validationState.hasConditions && !validationState.satisfied;
    const doesNotHaveValidationAndHasNotRun =
      !validationState.hasConditions && !hasRun;
    const disableNavigation =
      !hasSubmitted &&
      (hasValidationAndHasNotPassed || doesNotHaveValidationAndHasNotRun);

    if (!disableNavigation) {
      return null;
    } else if (isSubmittable) {
      // If the level is submittable and the user has not submitted,
      // they need to pass validation if it exists, otherwise they need to run their code.
      return hasValidationAndHasNotPassed
        ? codebridgeI18n.validationNotYetPassedSubmit()
        : codebridgeI18n.runToSubmit();
    } else if (hasValidationAndHasNotPassed) {
      // If we have a next level, show the continue text, otherwise show the finish text.
      return hasNextLevel
        ? codebridgeI18n.validationNotYetPassedContinue()
        : codebridgeI18n.validationNotYetPassedFinish();
    } else {
      // The user has not yet run their code if we get to this case.
      return hasNextLevel
        ? codebridgeI18n.runToContinue()
        : codebridgeI18n.runToFinish();
    }
  };

  const disabledNavigationTooltip = getDisabledNavigationTooltip();

  const awaitingPredictSubmit =
    !isStartMode && isPredictLevel && !hasPredictResponse;

  // Returns null if the code action buttons (run/test) should be enabled,
  // otherwise returns the help tip text explaining why they are disabled.
  // We disable the run/test buttons while the environment is loading
  // OR if this is a predict level, we are not in start mode
  // and the user has not yet written a prediction.
  const getDisabledCodeActionsTooltip = () => {
    let tooltip = null;
    if (awaitingPredictSubmit) {
      tooltip = codebridgeI18n.predictRunDisabledTooltip();
    } else if (isLoadingEnvironment) {
      tooltip = codebridgeI18n.loadingEnvironmentTooltip();
    }
    return tooltip;
  };

  const disabledCodeActionsTooltip = getDisabledCodeActionsTooltip();
  const disabledCodeActionsIcon = awaitingPredictSubmit
    ? 'fa-question-circle-o'
    : 'fa-spinner fa-spin';

  // We may want to expand the tooltip to cover the disabled button
  // as well. We will likely move these buttons; when we do consider
  // wrapping the buttons in a div with the icon and applying the tooltip to that div.
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
          {disabledCodeActionsTooltip &&
            renderDisabledButtonHelperIcon(
              disabledCodeActionsIcon,
              'codeActionsTooltip',
              disabledCodeActionsTooltip
            )}
          <Button
            text={'Run'}
            onClick={() => handleRun(false)}
            disabled={!!disabledCodeActionsTooltip}
            iconLeft={{iconStyle: 'solid', iconName: 'play'}}
            className={moduleStyles.runButton}
            size={'s'}
            color={'white'}
          />
          <Button
            text="Test"
            onClick={() => handleRun(true)}
            disabled={!!disabledCodeActionsTooltip}
            iconLeft={{iconStyle: 'solid', iconName: 'flask'}}
            color={'black'}
            size={'s'}
          />
        </span>
      )}
      <span className={moduleStyles.navigationButton}>
        {disabledNavigationTooltip &&
          renderDisabledButtonHelperIcon(
            'fa-question-circle-o',
            'submitButtonDisabled',
            disabledNavigationTooltip
          )}
        <Button
          text={navigationText}
          onClick={handleNavigation}
          disabled={!!disabledNavigationTooltip}
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
