import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  OverlineThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React, {useMemo} from 'react';

import CopyButton from './CopyButton';

import parentStyles from './debug-panel.module.scss';
import moduleStyles from './details-box.module.scss';

export interface DetailsField {
  label: string;
  value?: string | number;
  copyable?: boolean;
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
        <BodyThreeText className={moduleStyles.detailsHeaderText}>
          <StrongText>{title}</StrongText>
        </BodyThreeText>
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
              <div className={moduleStyles.detailsFieldLabelRow}>
                <OverlineThreeText className={moduleStyles.detailsFieldLabel}>
                  {field.label}
                </OverlineThreeText>
                {field.copyable && (
                  <CopyButton
                    label={field.label}
                    value={String(field.value ?? '')}
                  />
                )}
              </div>
              <pre className={moduleStyles.detailsFieldValueContainer}>
                <BodyThreeText className={moduleStyles.detailsFieldValue}>
                  {field.value}
                </BodyThreeText>
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
