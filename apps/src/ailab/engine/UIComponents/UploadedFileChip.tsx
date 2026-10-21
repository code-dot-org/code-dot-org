/* The student's uploaded CSV, removed by clicking it. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './uploadedFileChip.module.scss';

interface UploadedFileChipProps {
  fileName: string;
  onRemove: () => void;
}

const UploadedFileChip = ({fileName, onRemove}: UploadedFileChipProps) => (
  <button
    type="button"
    className={styles.chip}
    aria-label={`Remove ${fileName}`}
    onClick={onRemove}
  >
    <span className={styles.fileIcon}>
      <FontAwesomeV6Icon iconName="file-csv" iconStyle="solid" />
    </span>
    <Typography component="span" variant="label2" className={styles.name}>
      {fileName}
    </Typography>
    <FontAwesomeV6Icon
      iconName="xmark"
      iconStyle="solid"
      className={styles.removeIcon}
    />
  </button>
);

export default UploadedFileChip;
