import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ValidationSettings} from '../InstructionsV2';
import ValidationButton from '../ValidationButton';
import ValidationResults from '../ValidationResults';

import moduleStyles from '../instructions.module.scss';

const ValidationPanel: React.FC<ValidationSettings> = ({
  onValidate,
  onStopValidation,
  isValidating,
  isValidateDisabled,
}) => {
  const validationResults = useAppSelector(
    state => state.lab.validationState?.validationResults
  );
  return (
    <div>
      <ValidationButton
        onValidate={onValidate}
        onStopValidation={onStopValidation}
        isValidating={isValidating}
        isValidateDisabled={isValidateDisabled}
      />
      {validationResults && (
        <div className={moduleStyles.bubble}>
          <div className={moduleStyles.textContent}>
            <div className={moduleStyles.scrollingContent}>
              <ValidationResults />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;
