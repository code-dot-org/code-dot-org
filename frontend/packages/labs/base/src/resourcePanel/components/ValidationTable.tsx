import type {FunctionComponent} from 'react';

import {
  BodyThreeText,
  OverlineThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';

import ValidationStatusIcon from '../../instructions/components/ValidationStatusIcon';
import {
  getStatusForResult,
  getTranslatedResult,
} from '../../instructions/validationHelpers';
import {useAppSelector} from '../../redux/store';

import moduleStyles from './validation-panel.module.scss';

export interface ValidationResultsProps {
  className?: string;
}

const ValidationTable: FunctionComponent<ValidationResultsProps> = () => {
  const validationResults = useAppSelector(
    state => state.lab.validationState.validationResults,
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
              <OverlineThreeText>Test</OverlineThreeText>
            </td>
            <td>
              <OverlineThreeText>Result</OverlineThreeText>
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
