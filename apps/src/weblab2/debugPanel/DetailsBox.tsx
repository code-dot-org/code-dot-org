import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useMemo} from 'react';

import moduleStyles from './details-box.module.scss';
import parentStyles from './network-panel.module.scss';

interface DetailsField {
  label: string;
  value?: string | number;
}

interface DetailsBoxProps {
  title: string;
  status: 'success' | 'error' | 'pending';
  rows: DetailsField[][];
  errorMessage?: string;
}

const DetailsBox: React.FunctionComponent<DetailsBoxProps> = ({
  title,
  status,
  rows,
  errorMessage,
}) => {
  const {iconName, iconClassName, animationType} = useMemo(() => {
    switch (status) {
      case 'success':
        return {
          iconName: 'check-circle',
          iconClassName: parentStyles.successIcon,
        };
      case 'error':
        return {
          iconName: 'xmark-circle',
          iconClassName: parentStyles.errorIcon,
        };
      case 'pending':
        return {
          iconName: 'spinner',
          iconClassName: parentStyles.loadingIcon,
          animationType: 'spin' as const,
        };
    }
  }, [status]);

  return (
    <div className={moduleStyles.detailsBox}>
      <div className={moduleStyles.detailsHeader}>
        <Typography className={moduleStyles.detailsHeaderText} variant="body3">
          <Typography variant="strong">{title}</Typography>
        </Typography>
        <FontAwesomeV6Icon
          iconName={iconName}
          className={iconClassName}
          animationType={animationType}
        />
      </div>
      <div className={moduleStyles.detailsBody}>
        {errorMessage && <Alert text={errorMessage} type="danger" size="xs" />}
        {rows.map((row, rowIndex) => {
          const content = row.map(field => (
            <div key={field.label} className={moduleStyles.detailsField}>
              <Typography
                className={moduleStyles.detailsFieldLabel}
                variant="overline3"
              >
                {field.label}
              </Typography>
              <pre className={moduleStyles.detailsFieldValueContainer}>
                <Typography
                  className={moduleStyles.detailsFieldValue}
                  variant="body3"
                >
                  {field.value}
                </Typography>
              </pre>
            </div>
          ));

          return row.length > 1 ? (
            <div key={rowIndex} className={moduleStyles.detailsRow}>
              {content}
            </div>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
};

export default DetailsBox;
