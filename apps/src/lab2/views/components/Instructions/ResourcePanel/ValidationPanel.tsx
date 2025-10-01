import React from 'react';

import {ValidationSettings} from '../InstructionsV2';
import ValidationButton from '../ValidationButton';

import {
  resourcePanelValidationTableElementId,
  resourcePanelValidateButtonElementId,
} from './constants';
import ValidationTable from './ValidationTable';

import validationStyles from './validation-panel.module.scss';

const ValidationPanel: React.FC<ValidationSettings> = ({
  onValidate,
  onStopValidation,
  isValidating,
  isValidateDisabled,
}) => {
  return (
    <div className={validationStyles.validationPanel}>
      <div className={validationStyles.validationBubble}>
        <div id={resourcePanelValidationTableElementId}>
          <ValidationTable />
        </div>
        <div id={resourcePanelValidateButtonElementId}>
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
    </div>
  );
};

export default ValidationPanel;
