import classNames from 'classnames';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button from '@cdo/apps/componentLibrary/button';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  setHasRun,
  setIsRunning,
  setIsValidating,
} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';
import WithConditionalTooltip from '../components/WithConditionalTooltip';
import {appendSystemMessage} from '../redux/consoleRedux';
import {sendCodebridgeAnalyticsEvent} from '../utils/analyticsReporterHelper';

import moduleStyles from './console.module.scss';
import darkModeStyles from '@cdo/apps/lab2/styles/dark-mode.module.scss';

// Control buttons for running and stopping code.
// Can be extended in the future to include a test button.
const ControlButtons: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const {onRun, onStop} = useCodebridgeContext();

  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const hasPredictResponse = useAppSelector(
    state => !!state.predictLevel.response
  );
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  const isLoadingEnvironment = useAppSelector(
    state => state.lab2System.loadingCodeEnvironment
  );
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const isValidating = useAppSelector(state => state.lab2System.isValidating);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const awaitingPredictSubmit =
    !isStartMode && isPredictLevel && !hasPredictResponse;

  const resetStatus = useCallback(() => {
    dispatch(setHasRun(false));
    dispatch(setIsRunning(false));
    dispatch(setIsValidating(false));
  }, [dispatch]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, resetStatus);

  const handleRun = () => {
    if (onRun) {
      dispatch(setIsRunning(true));
      sendCodebridgeAnalyticsEvent(EVENTS.CODEBRIDGE_RUN_CLICK, appName);
      onRun(/*runTests*/ false, dispatch, source).finally(() =>
        dispatch(setIsRunning(false))
      );
      dispatch(setHasRun(true));
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

  // Returns null if the code action buttons (run, and in the future, test) should be enabled,
  // otherwise returns the help tip text explaining why they are disabled.
  // We disable the run button while the environment is loading
  // OR if this is a predict level, we are not in start mode,
  // and the user has not yet written a prediction.
  const getDisabledCodeActionsTooltip = () => {
    let tooltip = null;
    if (awaitingPredictSubmit) {
      tooltip = codebridgeI18n.predictRunDisabledTooltip();
    } else if (isLoadingEnvironment) {
      tooltip = codebridgeI18n.loadingEnvironmentTooltip();
    } else if (isValidating) {
      tooltip = codebridgeI18n.validatingRunDisabledTooltip();
    }
    return tooltip;
  };

  const disabledCodeActionsTooltip = getDisabledCodeActionsTooltip();
  const disabledCodeActionsIcon = isLoadingEnvironment
    ? 'fa-spinner fa-spin'
    : 'fa-question-circle-o';

  return (
    <div className={moduleStyles.controlButtons}>
      {isRunning ? (
        <Button
          text={'Stop'}
          onClick={handleStop}
          color={'destructive'}
          iconLeft={{iconStyle: 'solid', iconName: 'square'}}
          size={'xs'}
          className={moduleStyles.controlButton}
        />
      ) : (
        <WithConditionalTooltip
          iconName={disabledCodeActionsIcon}
          iconClassName={moduleStyles.disabledInfoIcon}
          showTooltip={!!disabledCodeActionsTooltip}
          tooltipProps={{
            direction: 'onRight',
            text: disabledCodeActionsTooltip || '',
            size: 's',
            tooltipId: 'code-actions-tooltip',
            className: darkModeStyles.tooltipRight,
          }}
        >
          <Button
            text={'Run'}
            onClick={handleRun}
            disabled={!!disabledCodeActionsTooltip}
            iconLeft={{iconStyle: 'solid', iconName: 'play'}}
            size={'xs'}
            color={'white'}
            className={classNames(
              moduleStyles.controlButton,
              darkModeStyles.primaryButton
            )}
          />
        </WithConditionalTooltip>
      )}
    </div>
  );
};

export default ControlButtons;
