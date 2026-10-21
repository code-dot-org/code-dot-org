import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import {useFocusVisible} from '../useFocusVisible';

import FullTextTooltip from './FullTextTooltip';

import styles from './uploadedFileChip.module.scss';

interface UploadedFileChipProps {
  fileName: string;
  onRemove: () => void;
}

const UploadedFileChip = ({fileName, onRemove}: UploadedFileChipProps) => {
  const {focusVisible, focusHandlers} = useFocusVisible();

  return (
    <button
      type="button"
      className={styles.chip}
      aria-label={`Remove ${fileName}`}
      onClick={onRemove}
      {...focusHandlers}
    >
      <span className={styles.fileIcon}>
        <FontAwesomeV6Icon iconName="file-csv" aria-hidden="true" />
      </span>
      <FullTextTooltip title={fileName} focused={focusVisible} placement="top">
        <Typography component="span" variant="label2" className={styles.name}>
          {fileName}
        </Typography>
      </FullTextTooltip>
      <FontAwesomeV6Icon
        iconName="xmark"
        className={styles.removeIcon}
        aria-hidden="true"
      />
    </button>
  );
};

export default UploadedFileChip;
