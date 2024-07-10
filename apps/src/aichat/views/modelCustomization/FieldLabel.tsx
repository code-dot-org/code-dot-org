import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
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
    <div className={styles.fieldLabelContainer}>
      <label htmlFor={id}>
        <BodyThreeText className={styles.fieldLabel}>
          <StrongText>{label}</StrongText>
        </BodyThreeText>
      </label>
      <WithTooltip
        tooltipProps={{
          text: tooltipText,
          size: 's',
          tooltipId: `${id}-tooltip`,
          direction: 'onRight',
          className: styles.tooltip,
        }}
      >
        <button type="button" className={styles.iconButton}>
          <FontAwesomeV6Icon iconName={'info-circle'} className={styles.icon} />
        </button>
      </WithTooltip>
    </div>
  );
};

export default FieldLabel;
