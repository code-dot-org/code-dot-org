import React from 'react';

import {WithTooltip} from '@cdo/apps/componentLibrary/tooltip';
import {BodyThreeText, StrongText} from '@cdo/apps/componentLibrary/typography';

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
    <WithTooltip
      tooltipProps={{
        text: tooltipText,
        size: 's',
        tooltipId: `${id}-tooltip`,
        direction: 'onLeft',
        className: styles.tooltip,
      }}
    >
      <label htmlFor={id}>
        <BodyThreeText className={styles.fieldLabel}>
          <StrongText>{label}</StrongText>
        </BodyThreeText>
      </label>
    </WithTooltip>
  );
};

export default FieldLabel;
