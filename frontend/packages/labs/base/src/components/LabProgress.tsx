import type {PropsWithChildren} from 'react';

import {ProgressContainer} from '@code-dot-org/progress';

import {useLevelProperties} from '../contexts/LevelPropertiesContext';
import {useAppSelector} from '../redux/store';

/**
 * Validates the current level: mounts the progress package's
 * ProgressContainer, which puts the level's validation state in the
 * progress slice and reports success once it is satisfied. The lab hands the
 * container its Validator through useProgressManager().
 */
const LabProgress = ({children}: PropsWithChildren) => {
  const levelProperties = useLevelProperties();
  // Levelbuilder start mode edits validations in place of the level's own.
  const overrideValidations = useAppSelector(
    state => state.lab.overrideValidations,
  );
  const isEditingExemplar = useAppSelector(
    state => !!state.lab.appOptions?.isEditingExemplar,
  );

  if (!levelProperties) {
    return children;
  }

  return (
    <ProgressContainer
      key={levelProperties.appName}
      appType={levelProperties.appName}
      levelId={levelProperties.id}
      validations={levelProperties.validations}
      exemplarSettings={levelProperties.exemplarSettings}
      isEditingExemplar={isEditingExemplar}
      overrideValidations={overrideValidations}
    >
      {children}
    </ProgressContainer>
  );
};

export default LabProgress;
