import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {
  getProgressLevelType,
  ProgressLevelType,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import ProgressManager from '@cdo/apps/lab2/progress/ProgressManager';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {setValidationState} from '../lab2Redux';

interface ProgressContainerProps {
  children: React.ReactNode;
  appType: string;
}

/**
 * Wrapper component for Labs that manage progress using a {@link ProgressManager}.
 * This component manages updating the progress manager with level data, hooking
 * its updates into Redux, and providing access for child components via context.
 */
const ProgressContainer: React.FunctionComponent<ProgressContainerProps> = ({
  children,
  appType,
}) => {
  const dispatch = useAppDispatch();
  const isScriptLevel = useSelector(
    state => getProgressLevelType(state) === ProgressLevelType.SCRIPT_LEVEL
  );

  const onProgressChange = useCallback(() => {
    console.log('in onProgressChange');
    const currentState = progressManager.current.getCurrentState();
    console.log({currentState});
    dispatch(setValidationState(currentState));

    // Tell the external system (if there is one) about the success.
    if (isScriptLevel && currentState.satisfied) {
      dispatch(sendSuccessReport(appType));
    }
  }, [dispatch, appType, isScriptLevel]);

  const progressManager = useRef<ProgressManager>(
    new ProgressManager(onProgressChange)
  );

  const levelValidations = useAppSelector(
    state => state.lab.levelProperties?.validations
  );

  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);

  useEffect(() => {
    console.log('setting up progress manager');
    console.log({levelValidations});
    progressManager.current.onLevelChange(levelValidations);
  }, [levelValidations, levelId, appName]);

  return (
    <ProgressManagerContext.Provider value={progressManager.current}>
      {children}
    </ProgressManagerContext.Provider>
  );
};

export const ProgressManagerContext: React.Context<ProgressManager | null> =
  React.createContext<ProgressManager | null>(null);

export default ProgressContainer;
