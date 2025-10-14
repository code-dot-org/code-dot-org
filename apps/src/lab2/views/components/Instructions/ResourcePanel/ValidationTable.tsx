import {
  BodyThreeText,
  OverlineThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';
import {
  getStatusForResult,
  getTranslatedResult,
} from '@cdo/apps/lab2/views/components/Instructions/validationHelpers';
import ValidationStatusIcon from '@cdo/apps/lab2/views/components/Instructions/ValidationStatusIcon';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
              <OverlineThreeText>{lab2I18n.test()}</OverlineThreeText>
            </td>
            <td>
              <OverlineThreeText>{lab2I18n.result()}</OverlineThreeText>
            </td>
          </tr>
        </thead>
        <tbody>
          {validationResults.map((result, index) => (
            <tr key={index}>
              <td>
                <BodyThreeText>{result.message}</BodyThreeText>
              </td>
              <td>
                <div className={moduleStyles.resultsText}>
                  <ValidationStatusIcon status={getStatusForResult(result)} />
                  <BodyThreeText>
                    <StrongText>{getTranslatedResult(result)}</StrongText>
                  </BodyThreeText>
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
