import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';

import type {ExemplarSettings} from '@code-dot-org/core/api';
import {storeHooks} from '@code-dot-org/core/redux';

import {ProgressLevelTypes} from './constants';
import ProgressManager from './ProgressManager';
import type {ProgressStore} from './redux/progressSlice';
import {
  getProgressLevelType,
  sendSuccessReport,
  setValidationState,
} from './redux/progressSlice';
import type {Validation} from './types';

const {useAppDispatch, useAppSelector} = storeHooks<ProgressStore>();

export interface ProgressContainerProps {
  children: ReactNode;
  /** Sent as `app` with the success milestone. */
  appType: string;
  /** Changing it resets validation even when the validations are equal. */
  levelId: number | string;
  validations?: Validation[];
  exemplarSettings?: ExemplarSettings;
  isEditingExemplar?: boolean;
  /** Levelbuilder start mode: validations being edited, used in their place. */
  overrideValidations?: Validation[];
}

export const ProgressManagerContext = createContext<ProgressManager | null>(
  null,
);

/** The ProgressManager of the nearest ProgressContainer, if any. */
export function useProgressManager(): ProgressManager | null {
  return useContext(ProgressManagerContext);
}

/**
 * Owns a ProgressManager for a lab: resets it when the level changes, mirrors
 * its state into the progress slice, and reports success on a script level
 * once the level's validations are satisfied. The lab gives the manager its
 * Validator through useProgressManager().
 */
export default function ProgressContainer({
  children,
  appType,
  levelId,
  validations,
  exemplarSettings,
  isEditingExemplar,
  overrideValidations,
}: ProgressContainerProps) {
  const dispatch = useAppDispatch();
  const isScriptLevel = useAppSelector(
    state => getProgressLevelType(state) === ProgressLevelTypes.ScriptLevel,
  );

  // The manager outlives renders; this effect, declared before the one that
  // resets the manager, keeps its callback on the current props.
  const [progressManager] = useState(() => new ProgressManager(() => {}));
  useEffect(() => {
    progressManager.setOnProgressChange(() => {
      const currentState = progressManager.getCurrentState();
      dispatch(setValidationState(currentState));
      if (isScriptLevel && currentState.satisfied) {
        dispatch(sendSuccessReport(appType));
      }
    });
  }, [dispatch, progressManager, isScriptLevel, appType]);

  useEffect(() => {
    progressManager.onLevelChange(
      {isEditingExemplar},
      overrideValidations ?? validations,
      exemplarSettings,
    );
  }, [
    progressManager,
    levelId,
    validations,
    exemplarSettings,
    isEditingExemplar,
    overrideValidations,
  ]);

  return (
    <ProgressManagerContext.Provider value={progressManager}>
      {children}
    </ProgressManagerContext.Provider>
  );
}
