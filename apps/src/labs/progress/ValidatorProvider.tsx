import React, {useContext, useEffect} from 'react';
import {ProgressManagerContext} from './ProgressContainer';
import {Validator} from './ProgressManager';

/**
 * Utility component for providing a {@link Validator} to the current {@link ProgressManager}.
 * This is mostly to avoid using more complex React context syntax in class components.
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
