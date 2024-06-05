import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {
  getProgressLevelType,
  ProgressLevelType,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import ProgressManager from '@cdo/apps/lab2/progress/ProgressManager';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {setValidationState} from '../lab2Redux';
import {ProjectLevelData} from '../types';

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

  const levelDataValidations = useAppSelector(
    state =>
      (state.lab.levelProperties?.levelData as ProjectLevelData | undefined)
        ?.validations
  );
  const levelValidations = useAppSelector(
    state => state.lab.levelProperties?.validations
  );

  useEffect(() => {
    // Use validations on level properties if present, otherwise fallback to validations in level data.
    progressManager.current.onLevelChange(
      levelValidations || levelDataValidations
    );
  }, [levelValidations, levelDataValidations]);

  return (
    <ProgressManagerContext.Provider value={progressManager.current}>
      {children}
    </ProgressManagerContext.Provider>
  );
};

export const ProgressManagerContext: React.Context<ProgressManager | null> =
  React.createContext<ProgressManager | null>(null);

export default ProgressContainer;
