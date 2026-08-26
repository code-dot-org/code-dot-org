import React from 'react';

import ValidationButton from '@cdo/apps/lab2/views/components/Instructions/ValidationButton';
import {getTranslatedResult} from '@cdo/apps/lab2/views/components/Instructions/validationHelpers';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const validationResults = useAppSelector(
    state => state.lab.validationState.validationResults
  );

  const results = validationResults ?? [];
  // Tests read PENDING while a run is in flight, so wait for the last one.
  const hasFinished =
    results.length > 0 && results.every(result => result.result !== 'PENDING');
  const spokenResults = hasFinished
    ? results
        .map(result => `${result.message}: ${getTranslatedResult(result)}`)
        .join('. ')
    : '';

  return (
    <div className={validationStyles.validationPanel}>
      <div className={validationStyles.validationBubble}>
        <div id={resourcePanelValidationTableElementId}>
          <ValidationTable />
        </div>
        {/* The button swaps to "Stop validation", which announces the run. */}
        <div id={resourcePanelValidateButtonElementId} role="status">
          <ValidationButton
            onValidate={onValidate}
            onStopValidation={onStopValidation}
            isValidating={isValidating}
            isValidateDisabled={isValidateDisabled}
          />
        </div>
      </div>
      {/* Speaks the outcome; the table is there to be navigated. */}
      <div role="status" className={validationStyles.srOnly}>
        {spokenResults}
      </div>
    </div>
  );
};

export default ValidationPanel;
