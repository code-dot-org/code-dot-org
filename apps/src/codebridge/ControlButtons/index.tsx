import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {appendSystemMessage} from '@codebridge/redux/consoleRedux';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import Button from '@cdo/apps/componentLibrary/button';
import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import {START_SOURCES} from '@cdo/apps/lab2/constants';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {setHasRun, setIsRunning} from '@cdo/apps/lab2/redux/systemRedux';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './control-buttons.module.scss';

const ControlButtons: React.FunctionComponent = () => {
  const {onRun, onStop} = useCodebridgeContext();

  const dispatch = useAppDispatch();

  const source = useAppSelector(
    state => state.lab2Project.projectSource?.source
  ) as MultiFileSource | undefined;
  const hasPredictResponse = useAppSelector(
    state => !!state.predictLevel.response
  );
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isLoadingEnvironment = useAppSelector(
    state => state.lab2System.loadingCodeEnvironment
  );
  const isRunning = useAppSelector(state => state.lab2System.isRunning);

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

  const handleRun = () => {
    if (onRun) {
      dispatch(setIsRunning(true));
      onRun(/* runTests */ false, dispatch, source).finally(() =>
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
            onClick={handleRun}
            disabled={!!disabledCodeActionsTooltip}
            iconLeft={{iconStyle: 'solid', iconName: 'play'}}
            className={moduleStyles.runButton}
            size={'s'}
            color={'white'}
          />
        </span>
      )}
    </div>
  );
};

export default ControlButtons;
