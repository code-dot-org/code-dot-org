import {useEffect} from 'react';

import {setOverrideValidations} from '@cdo/apps/lab2/lab2Redux';
import {PASSED_ALL_TESTS_VALIDATION} from '@cdo/apps/lab2/progress/constants';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

// In start mode, keep overrideValidations in sync with the project's files. Deriving
// it here keeps it correct for any number of validation files and any way one
// is added or removed (type change, delete, etc).
export const useSyncValidationOverride = () => {
  const dispatch = useAppDispatch();
  const isStartMode = getIsStartMode();
  const hasValidationFile = useAppSelector(state => {
    const source = state.lab2Project.projectSources?.source as MultiFileSource;
    return Object.values(source?.files ?? {}).some(
      file => file.type === ProjectFileType.VALIDATION
    );
  });

  useEffect(() => {
    if (!isStartMode) {
      return;
    }
    // An empty array is still an active override meaning "no validations",
    // which is what we want in start mode: removing the validation file shows
    // "no validation" rather than falling back to the level's saved validations.
    dispatch(
      setOverrideValidations(
        hasValidationFile ? [PASSED_ALL_TESTS_VALIDATION] : []
      )
    );
  }, [isStartMode, hasValidationFile, dispatch]);
};
