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
    const currentState = progressManager.current.getCurrentState();
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
  const overrideValidations = useAppSelector(
    state => state.lab.overrideValidations
  );

  const levelId = useAppSelector(state => state.lab.levelProperties?.id);

  useEffect(() => {
    // The levelValidations may be the same between two different levels,
    // but we still want the progressManager to reset itself when the levelId changes.
    if (overrideValidations) {
      progressManager.current.onLevelChange(overrideValidations);
    } else {
      progressManager.current.onLevelChange(levelValidations);
    }
  }, [levelValidations, levelId, overrideValidations]);

  return (
    <ProgressManagerContext.Provider value={progressManager.current}>
      {children}
    </ProgressManagerContext.Provider>
  );
};

export const ProgressManagerContext: React.Context<ProgressManager | null> =
  React.createContext<ProgressManager | null>(null);

export default ProgressContainer;
