import classNames from 'classnames';
import React from 'react';

import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './styles/validation-results.module.scss';

interface ValidationResultsProps {
  className?: string;
}

const ValidationResults: React.FunctionComponent<ValidationResultsProps> = ({
  className,
}) => {
  const validationResults = useAppSelector(
    state => state.lab.validationState.validationResults
  );

  if (!validationResults) {
    return null;
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

  return (
    <div className={className}>
      {validationResults.map((result, index) => (
        <div key={index}>
          <i className={getClassForResult(result)} />
          {result.message}
        </div>
      ))}
    </div>
  );
};

export default ValidationResults;
