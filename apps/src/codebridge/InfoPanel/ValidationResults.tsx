import classNames from 'classnames';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/validation-results.module.scss';

interface ValidationResultsProps {
  className?: string;
}

function getClassForResult(result: ValidationResult) {
  switch (result.result) {
    case 'PASS':
    case 'EXPECTED_FAILURE':
      return classNames(moduleStyles.passIcon, 'fa-solid fa-check-circle');
    case 'FAIL':
    case 'UNEXPECTED_SUCCESS':
      return classNames(moduleStyles.failIcon, 'fa-solid fa-times-circle');
    case 'SKIP':
      return classNames(moduleStyles.cautionIcon, 'fa-solid fa-minus-circle');
    case 'ERROR':
      return classNames(
        moduleStyles.failIcon,
        'fa-solid fa-exclamation-circle'
      );
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
                    <i className={getClassForResult(result)} />
                    {result.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={moduleStyles.testSummary}>
            {satisfied ? (
              <>
                <i
                  className={classNames(
                    moduleStyles.passIcon,
                    'fa-solid fa-check-circle'
                  )}
                />{' '}
                {codebridgeI18n.allTestsPassed()}
              </>
            ) : (
              <>
                <i
                  className={classNames(
                    moduleStyles.failIcon,
                    'fa-solid fa-exclamation-circle'
                  )}
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
