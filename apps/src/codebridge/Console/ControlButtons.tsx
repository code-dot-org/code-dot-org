import Button from '@code-dot-org/component-library/button';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import WithConditionalTooltip from '@codebridge/components/WithConditionalTooltip';
import {MiniApps} from '@codebridge/constants';
import React, {useCallback} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {
  setHasRun,
  setIsRunning,
  setIsValidating,
  setHasValidated,
  setHasError,
} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {UserLevelInteractions} from '@cdo/generated-scripts/sharedConstants';

import {getSystemMessage} from './MessageHelpers';

import moduleStyles from './console.module.scss';

// Control buttons for running and stopping code.
// Can be extended in the future to include a test button.
const ControlButtons: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const {onRun, onStop, levelProperties} = useCodebridgeContext();
  const {id: levelId, appName, predictSettings} = levelProperties;
  const isPredictLevel = predictSettings?.isPredictLevel;
  const levelPath =
    useAppSelector(state => getCurrentLevel(state)?.path) || 'standalone';

  const scriptId = useAppSelector(state => state.lab.scriptId);
  const source = useAppSelector(
    state => state.lab2Project.projectSources?.source
  ) as MultiFileSource | undefined;
  const hasPredictResponse = useAppSelector(
    state => !!state.predictLevel.response
  );
  const hasLoadedEnvironment = useAppSelector(
    state => state.lab2System.loadedCodeEnvironment
  );
  const isRunning = useAppSelector(state => state.lab2System.isRunning);
  const isValidating = useAppSelector(state => state.lab2System.isValidating);

  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

  const awaitingPredictSubmit =
    !isStartMode && isPredictLevel && !hasPredictResponse;

  const miniApp = useAppSelector(
    state => state.lab2Project.projectSources?.labConfig?.miniApp?.name
  );

  const resetStatus = useCallback(() => {
    dispatch(setHasRun(false));
    dispatch(setIsRunning(false));
    dispatch(setIsValidating(false));
    dispatch(setHasValidated(false));
    dispatch(setHasError(false));
  }, [dispatch]);

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, resetStatus);

  const handleRun = () => {
    if (onRun) {
      dispatch(setIsRunning(true));
      sendLab2AnalyticsEvent(EVENTS.CODEBRIDGE_RUN_CLICK, appName, {
        levelPath,
      });
      logUserLevelInteraction({
        levelId: levelId,
        scriptId: scriptId,
        interaction: UserLevelInteractions.click_run,
      });
      onRun(/*runTests*/ false, dispatch, source).finally(() => {
        // We don't set isRunning to false when running the neighborhood,
        // as the neighborhood animation handles setting isRunning to false
        // once it is done.
        if (miniApp !== MiniApps.Neighborhood) {
          dispatch(setIsRunning(false));
        }
      });
      dispatch(setHasRun(true));
    } else {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemMessage(codebridgeI18n.handleRunError(), appName)
        );
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
      dispatch(setIsRunning(false));
    } else {
      CodebridgeRegistry.getInstance()
        .getConsoleManager()
        ?.writeConsoleMessage(
          getSystemMessage(codebridgeI18n.handleStopError(), appName)
        );
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
    } else if (!hasLoadedEnvironment) {
      tooltip = codebridgeI18n.loadingEnvironmentTooltip();
    } else if (isValidating) {
      tooltip = codebridgeI18n.validatingRunDisabledTooltip();
    }
    return tooltip;
  };

  const disabledCodeActionsTooltip = getDisabledCodeActionsTooltip();
  const disabledCodeActionsIcon = !hasLoadedEnvironment
    ? 'fa-spinner fa-spin'
    : 'fa-question-circle-o';

  return (
    <div className={moduleStyles.controlButtons}>
      {isRunning ? (
        <Button
          text={codebridgeI18n.stop()}
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
          }}
        >
          <Button
            id="uitest-codebridge-run"
            text={codebridgeI18n.run()}
            onClick={handleRun}
            disabled={!!disabledCodeActionsTooltip}
            iconLeft={{iconStyle: 'solid', iconName: 'play'}}
            size={'xs'}
            type={'primary'}
            className={moduleStyles.controlButton}
          />
        </WithConditionalTooltip>
      )}
    </div>
  );
};

export default ControlButtons;
