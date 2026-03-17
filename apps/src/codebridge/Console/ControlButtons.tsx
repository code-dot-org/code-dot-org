import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';
import WithConditionalTooltip from '@codebridge/components/WithConditionalTooltip';
import {MiniApps} from '@codebridge/constants';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
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
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
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
  const logLevelActivity = useLevelActivityMetrics(levelProperties);
  const isPredictLevel = predictSettings?.isPredictLevel;

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
      logLevelActivity();
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
    ? 'fa-spinner fa-spin fa-solid'
    : 'fa-question-circle fa-regular';

  return (
    <div className={moduleStyles.controlButtons}>
      {isRunning ? (
        <MuiButton
          variant="contained"
          color="error"
          size="extraSmall"
          className={moduleStyles.controlButton}
          onClick={handleStop}
          type="button"
          startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="square" />}
        >
          {codebridgeI18n.stop()}
        </MuiButton>
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
          <MuiButton
            variant="contained"
            color="primary"
            size="extraSmall"
            disabled={!!disabledCodeActionsTooltip}
            className={moduleStyles.controlButton}
            id="uitest-codebridge-run"
            onClick={handleRun}
            type="button"
            startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="play" />}
          >
            {codebridgeI18n.run()}
          </MuiButton>
        </WithConditionalTooltip>
      )}
    </div>
  );
};

export default ControlButtons;
