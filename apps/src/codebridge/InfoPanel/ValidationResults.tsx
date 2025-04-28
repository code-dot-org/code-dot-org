import {
  BodyFourText,
  Heading4,
  Heading6,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ValidationStatusIcon from './ValidationStatusIcon';

import moduleStyles from './styles/validation-results.module.scss';

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
      return 'error';
  }
}

function getTranslatedResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
      return codebridgeI18n.pass();
    case 'FAIL':
      return codebridgeI18n.fail();
    case 'SKIP':
      return codebridgeI18n.skip();
    case 'EXPECTED_FAILURE':
      return codebridgeI18n.expectedFailure();
    case 'UNEXPECTED_SUCCESS':
      return codebridgeI18n.unexpectedSuccess();
    case 'ERROR':
      return codebridgeI18n.error();
  }
}

const ValidationResults: React.FunctionComponent<ValidationResultsProps> = ({
  className,
}) => {
  const {validationResults} = useAppSelector(
    state => state.lab.validationState
  );
  const isValidating = useAppSelector(state => state.lab2System.isValidating);

  if (!validationResults) {
    return null;
  }

  return (
    <div className={classNames(className, moduleStyles.validationResults)}>
      <Heading4>{codebridgeI18n.validationResults()}</Heading4>
      {isValidating && <i className="fa fa-spinner fa-spin" />}
      {!isValidating && (
        <div>
          <table className={moduleStyles.validationResultsTable}>
            <thead>
              <tr>
                <td>
                  <Heading6>{codebridgeI18n.testName()}</Heading6>
                </td>
                <td>
                  <Heading6>{codebridgeI18n.result()}</Heading6>
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
      )}
    </div>
  );
};

export default ValidationResults;
