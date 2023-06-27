import {ProgressManagerContext} from '@cdo/apps/labs/progress/ProgressContainer';
import {Validator} from '@cdo/apps/labs/progress/ProgressManager';
import React, {useContext, useEffect} from 'react';

/**
 * Utility component for providing a {@link Validator} to the current {@link ProgressManager}.
 * This is mostly to avoid using more complex React context syntax in class components
 * (like MusicView).
 */
const ValidatorProvider: React.FunctionComponent<{validator: Validator}> = ({
  validator,
}) => {
  const progressManager = useContext(ProgressManagerContext);

  useEffect(() => {
    if (progressManager) {
      progressManager.setValidator(validator);
    }
  }, [progressManager, validator]);

  return null;
};

export default ValidatorProvider;
