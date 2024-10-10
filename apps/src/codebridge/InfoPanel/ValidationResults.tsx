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

const ValidationResults: React.FunctionComponent<ValidationResultsProps> = ({
  className,
}) => {
  const {validationResults, satisfied} = useAppSelector(
    state => state.lab.validationState
  );
  const isValidating = useAppSelector(state => state.lab2System.isValidating);

  if (!validationResults) {
    return null;
  }

  return (
    <div className={classNames(className, moduleStyles.validationResults)}>
      <h4>{codebridgeI18n.validationResults()}</h4>
      {isValidating && <i className="fa fa-spinner fa-spin" />}
      {!isValidating && (
        <div>
          <table className={moduleStyles.validationResultsTable}>
            <thead>
              <tr>
                <td>{codebridgeI18n.testName()}</td>
                <td>{codebridgeI18n.result()}</td>
              </tr>
            </thead>
            <tbody>
              {validationResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.message}</td>
                  <td>
                    <ValidationStatusIcon
                      status={getStatusForResult(result)}
                      className={moduleStyles.icon}
                    />
                    {result.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={moduleStyles.testSummary}>
            {satisfied ? (
              <>
                <ValidationStatusIcon
                  status="passed"
                  className={moduleStyles.icon}
                />{' '}
                {codebridgeI18n.allTestsPassed()}
              </>
            ) : (
              <>
                <ValidationStatusIcon
                  status="failed"
                  className={moduleStyles.icon}
                />{' '}
                {codebridgeI18n.testsDidNotPass()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;
