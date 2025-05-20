import {
  BodyThreeText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import InfoTooltipIcon from '../InfoTooltipIcon';

import styles from '../model-customization-workspace.module.scss';

interface FieldLabelProps {
  id: string;
  label: string;
  tooltipText: string;
}

const FieldLabel: React.FunctionComponent<FieldLabelProps> = ({
  id,
  label,
  tooltipText,
}) => {
  return (
    <div className={styles.fieldLabelContainer}>
      <label htmlFor={id}>
        <BodyThreeText className={styles.fieldLabel}>
          <StrongText>{label}</StrongText>
        </BodyThreeText>
      </label>
      <InfoTooltipIcon id={id} tooltipText={tooltipText} direction="onRight" />
    </div>
  );
};

export default FieldLabel;
