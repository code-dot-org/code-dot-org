import {Typography} from '@mui/material';
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
      <Typography variant="h4" gutterBottom>
        {lab2I18n.validationResults()}
      </Typography>
      <div>
        <table className={moduleStyles.validationResultsTable}>
          <thead>
            <tr>
              <td>
                <Typography variant="h6" gutterBottom>
                  {lab2I18n.testName()}
                </Typography>
              </td>
              <td>
                <Typography variant="h6" gutterBottom>
                  {lab2I18n.result()}
                </Typography>
              </td>
            </tr>
          </thead>
          <tbody>
            {validationResults.map((result, index) => (
              <tr key={index}>
                <td>
                  <Typography variant="body4" gutterBottom>
                    {result.message}
                  </Typography>
                </td>
                <td>
                  <div className={moduleStyles.results}>
                    <ValidationStatusIcon
                      status={getStatusForResult(result)}
                      className={moduleStyles.icon}
                    />
                    <Typography variant="body4" gutterBottom>
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
    </div>
  );
};

export default ValidationResults;
