import {
  BodyFourText,
  Heading4,
  Heading6,
  StrongText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {getStatusForResult, getTranslatedResult} from './validationHelpers';
import ValidationStatusIcon from './ValidationStatusIcon';

import moduleStyles from './validation-results.module.scss';

interface ValidationResultsProps {
  className?: string;
}

// TODO: When Python Lab uses the resource panel permanently, we can remove this component.
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
      <Heading4>{lab2I18n.validationResults()}</Heading4>
      <div>
        <table className={moduleStyles.validationResultsTable}>
          <thead>
            <tr>
              <td>
                <Heading6>{lab2I18n.testName()}</Heading6>
              </td>
              <td>
                <Heading6>{lab2I18n.result()}</Heading6>
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
