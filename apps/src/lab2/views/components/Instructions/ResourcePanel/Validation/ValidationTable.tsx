import {Typography} from '@mui/material';
import React, {useEffect} from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';
import {
  getStatusForResult,
  getTranslatedResult,
} from '@cdo/apps/lab2/views/components/Instructions/validationHelpers';
import ValidationStatusIcon from '@cdo/apps/lab2/views/components/Instructions/ValidationStatusIcon';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  resourcePanelValidationTableElementId,
  VALIDATION_COMPLETE_EVENT,
} from './constants';

import moduleStyles from './validation-panel.module.scss';

interface ValidationResultsProps {
  className?: string;
}

const ValidationTable: React.FunctionComponent<ValidationResultsProps> = ({
  className,
}) => {
  const validationResults = useAppSelector(
    state => state.lab.validationState.validationResults
  );

  // Fire an event when validation results are first available.
  // This is used by the validation intro tour to auto-advance the tour.
  useEffect(() => {
    if (validationResults) {
      document
        .querySelector(`#${resourcePanelValidationTableElementId}`)
        ?.dispatchEvent(
          new CustomEvent(VALIDATION_COMPLETE_EVENT, {
            bubbles: true,
          })
        );
    }
  }, [validationResults]);

  if (!validationResults) {
    return null;
  }

  return (
    <div
      id="resource-panel-validation-results"
      className={moduleStyles.validationResults}
    >
      <table className={moduleStyles.validationResultsTable}>
        <thead>
          <tr>
            <td>
              <Typography variant="overline3" gutterBottom>
                {lab2I18n.test()}
              </Typography>
            </td>
            <td>
              <Typography variant="overline3" gutterBottom>
                {lab2I18n.result()}
              </Typography>
            </td>
          </tr>
        </thead>
        <tbody>
          {validationResults.map((result, index) => (
            <tr key={index}>
              <td>
                <Typography variant="body3" gutterBottom>
                  {result.message}
                </Typography>
              </td>
              <td>
                <div className={moduleStyles.resultsText}>
                  <ValidationStatusIcon status={getStatusForResult(result)} />
                  <Typography variant="body3" gutterBottom>
                    <Typography variant="strong">
                      {getTranslatedResult(result)}
                    </Typography>
                  </Typography>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValidationTable;
