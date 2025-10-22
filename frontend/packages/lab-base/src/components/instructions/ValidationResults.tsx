import classNames from 'classnames';
import React from 'react';

import {
  BodyFourText,
  Heading4,
  Heading6,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {ValidationResult} from '@code-dot-org/progress';

import {useAppSelector} from '../../redux/store';

import ValidationStatusIcon from './ValidationStatusIcon';

import moduleStyles from './validation-results.module.scss';

interface ValidationResultsProps {
  className?: string;
}

function getStatusForResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
    case 'EXPECTED_FAILURE':
      return 'passed';
    case 'FAIL':
    case 'UNEXPECTED_SUCCESS':
      return 'failed';
    case 'SKIP':
      return 'caution';
    case 'ERROR':
    default:
      return 'error';
  }
}

function getTranslatedResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
      return "Pass";
    case 'FAIL':
      return "Fail";
    case 'SKIP':
      return "Skip";
    case 'EXPECTED_FAILURE':
      return "Expected failure";
    case 'UNEXPECTED_SUCCESS':
      return "Unexpected success";
    case 'ERROR':
      return "Error";
  }
}

const ValidationResults: React.FunctionComponent<ValidationResultsProps> = ({
  className,
}) => {
  const {validationResults} = useAppSelector(
    state => state.lab.validationState
  );

  if (!validationResults) {
    return null;
  }

  return (
    <div className={classNames(className, moduleStyles.validationResults)}>
      <Heading4>{"Validation Results"}</Heading4>
      <div>
        <table className={moduleStyles.validationResultsTable}>
          <thead>
            <tr>
              <td>
                <Heading6>Test Name</Heading6>
              </td>
              <td>
                <Heading6>Result</Heading6>
              </td>
            </tr>
          </thead>
          <tbody>
            {validationResults.map((result, index) => (
              <tr key={index}>
                <td>
                  <BodyFourText>{result.message}</BodyFourText>
                </td>
                <td>
                  <div className={moduleStyles.results}>
                    <ValidationStatusIcon
                      status={getStatusForResult(result)}
                      className={moduleStyles.icon}
                    />
                    <BodyFourText>
                      <StrongText>{getTranslatedResult(result)}</StrongText>
                    </BodyFourText>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidationResults;
