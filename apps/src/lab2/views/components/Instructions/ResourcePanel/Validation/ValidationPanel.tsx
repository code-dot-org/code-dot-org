import React from 'react';

import ValidationButton from '@cdo/apps/lab2/views/components/Instructions/ValidationButton';

import {
  resourcePanelValidationTableElementId,
  resourcePanelValidateButtonElementId,
} from '../constants';

import ValidationTable from './ValidationTable';

import validationStyles from './validation-panel.module.scss';

export interface ValidationSettings {
  onValidate: () => void;
  onStopValidation: () => void;
  isValidating: boolean;
  isValidateDisabled: boolean;
}

const ValidationPanel: React.FC<ValidationSettings> = ({
  onValidate,
  onStopValidation,
  isValidating,
  isValidateDisabled,
}) => {
  return (
    <div className={validationStyles.validationPanel}>
      <div className={validationStyles.validationBubble}>
        {/* On the wrapper, not the table: a live region must exist before the
            content it announces, and the table is empty until there are
            results. */}
        <div
          id={resourcePanelValidationTableElementId}
          aria-live="polite"
          aria-atomic="true"
        >
          <ValidationTable />
        </div>
        {/* Swapping to "Stop validation" announces the run. */}
        <div id={resourcePanelValidateButtonElementId} role="status">
          <ValidationButton
            onValidate={onValidate}
            onStopValidation={onStopValidation}
            isValidating={isValidating}
            isValidateDisabled={isValidateDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ValidationPanel;
