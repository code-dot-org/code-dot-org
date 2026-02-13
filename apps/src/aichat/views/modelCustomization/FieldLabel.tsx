import {Typography} from '@mui/material';
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
        <Typography className={styles.fieldLabel} variant="body3" gutterBottom>
          <Typography variant="strong">{label}</Typography>
        </Typography>
      </label>
      <InfoTooltipIcon id={id} tooltipText={tooltipText} direction="onRight" />
    </div>
  );
};

export default FieldLabel;
