import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyThreeText,
  OverlineThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import moduleStyles from './details-box.module.scss';

interface DetailsField {
  label: string;
  value?: string | number;
}

interface DetailsBoxProps {
  title: string;
  success: boolean;
  rows: DetailsField[][];
}

const DetailsBox: React.FunctionComponent<DetailsBoxProps> = ({
  title,
  success,
  rows,
}) => {
  return (
    <div className={moduleStyles.detailsBox}>
      <div className={moduleStyles.detailsHeader}>
        <BodyThreeText className={moduleStyles.detailsHeaderText}>
          <StrongText>{title}</StrongText>
        </BodyThreeText>
        <FontAwesomeV6Icon
          iconName={success ? 'check-circle' : 'xmark-circle'}
          className={
            success ? moduleStyles.successIcon : moduleStyles.errorIcon
          }
        />
      </div>
      <div className={moduleStyles.detailsBody}>
        {rows.map((row, rowIndex) => {
          const content = row.map(field => (
            <div key={field.label} className={moduleStyles.detailsField}>
              <OverlineThreeText className={moduleStyles.detailsFieldLabel}>
                {field.label}
              </OverlineThreeText>
              <BodyThreeText className={moduleStyles.detailsFieldValue}>
                {field.value}
              </BodyThreeText>
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
