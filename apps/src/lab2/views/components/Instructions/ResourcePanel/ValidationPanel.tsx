import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ValidationSettings} from '../InstructionsV2';
import ValidationButton from '../ValidationButton';

import ValidationTable from './ValidationTable';

import validationStyles from './validation-panel.module.scss';
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
    <div className={validationStyles.validationPanel}>
      <div className={validationStyles.validationBubble}>
        {validationResults && (
          <div className={validationStyles.validationResults}>
            <div className={moduleStyles.textContent}>
              <div className={moduleStyles.scrollingContent}>
                <ValidationTable />
              </div>
            </div>
          </div>
        )}
        <ValidationButton
          onValidate={onValidate}
          onStopValidation={onStopValidation}
          isValidating={isValidating}
          isValidateDisabled={isValidateDisabled}
          buttonColor="purple"
          buttonType="primary"
        />
      </div>
    </div>
  );
};

export default ValidationPanel;
