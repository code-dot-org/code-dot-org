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
import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';
import {logUserLevelInteraction} from '@cdo/apps/userLevelInteractionsLogger/userLevelInteractionsApi';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {UserLevelInteractions} from '@cdo/generated-scripts/sharedConstants';

import {getSystemMessage} from './MessageHelpers';
import useControlFocusHandoff from './useControlFocusHandoff';

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
  const codeEnvironmentError = useAppSelector(
    state => state.lab2System.codeEnvironmentError
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

  const clearIsRunningWhenOutputEnds = useCallback(async () => {
    // The neighborhood clears it itself when its animation finishes.
    if (miniApp === MiniApps.Neighborhood) {
      return;
    }
    if (miniApp === MiniApps.Theater) {
      if (appName === 'javalab') {
        // Java Lab leaves the run button in 'stop' state.
        return;
      }
      // Ensure the audio/visual playback has finished before clearing the run state.
      await CodebridgeRegistry.getInstance()
        .getTheater()
        ?.waitUntilPlaybackDone();
    }
    dispatch(setIsRunning(false));
  }, [appName, dispatch, miniApp]);

  const handleRun = () => {
    if (onRun) {
      dispatch(setIsRunning(true));
      logUserLevelInteraction({
        levelId: levelId,
        scriptId: scriptId,
        interaction: UserLevelInteractions.click_run,
      });
      onRun(/*runTests*/ false, dispatch, source).finally(
        clearIsRunningWhenOutputEnds
      );
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

  // Returns null if the code action buttons (run, and in the future, test)
  // should not have a tooltip, otherwise returns any tooltip text.
  // We show a tooltip and disable the run button if the environment is still loading
  // OR if this is a predict level, we are not in start mode,
  // and the user has not yet written a prediction.
  // A failed environment gets no tooltip: the workspace shows an alert for it instead,
  // and the button gets disabled below.
  const getDisabledCodeActionsTooltip = () => {
    if (codeEnvironmentError) {
      return null;
    }
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

  // Only a safety net now that Run and Stop share one element: it acts solely
  // when focus has actually landed on <body>, which the tooltip appearing or
  // disappearing can still cause.
  const {
    ref: controlsRef,
    onFocus: handleFocus,
    onBlur: handleBlur,
  } = useControlFocusHandoff<HTMLDivElement>(isRunning);

  const disabledCodeActionsTooltip = getDisabledCodeActionsTooltip();
  const disableCodeActions =
    !!codeEnvironmentError || !!disabledCodeActionsTooltip;
  const isEnvironmentLoading = !hasLoadedEnvironment && !codeEnvironmentError;

  return (
    <div
      className={moduleStyles.controlButtons}
      ref={controlsRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/*
        Run and Stop are one element, not two branches of a ternary. Rendering
        them separately unmounted whichever button had focus when a run started
        or ended, dropping focus to <body>, which a screen reader reads out as
        the page title. Sharing the element keeps the node -- and the focus --
        across the swap. The tooltip wrapper is always rendered, and renders a
        plain div when it has nothing to say, so the two states stay structurally
        identical and React reuses the button rather than replacing it.
      */}
      <WithConditionalTooltip
        showTooltip={!isRunning && !!disabledCodeActionsTooltip}
        tooltipProps={{
          direction: 'onRight',
          text: disabledCodeActionsTooltip || '',
          size: 's',
          tooltipId: 'code-actions-tooltip',
        }}
      >
        <MuiButton
          variant="contained"
          color={isRunning ? 'error' : 'primary'}
          size="extraSmall"
          disabled={!isRunning && disableCodeActions}
          loading={!isRunning && isEnvironmentLoading}
          loadingPosition="start"
          className={moduleStyles.controlButton}
          // Ctrl+2 and the UI tests target the run button; while a program is
          // running there is no run button to target.
          id={isRunning ? undefined : 'uitest-codebridge-run'}
          onClick={isRunning ? handleStop : handleRun}
          type="button"
          sx={isRunning ? undefined : getRunButtonSx()}
          startIcon={
            <FontAwesomeV6Icon
              iconStyle="solid"
              iconName={isRunning ? 'square' : 'play'}
            />
          }
        >
          {isRunning ? codebridgeI18n.stop() : codebridgeI18n.run()}
        </MuiButton>
      </WithConditionalTooltip>
    </div>
  );
};

export default ControlButtons;
