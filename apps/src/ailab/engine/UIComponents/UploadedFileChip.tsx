/* The student's uploaded CSV, removed by clicking it. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import FullTextTooltip from './FullTextTooltip';

import styles from './uploadedFileChip.module.scss';

interface UploadedFileChipProps {
  fileName: string;
  onRemove: () => void;
}

const UploadedFileChip = ({fileName, onRemove}: UploadedFileChipProps) => {
  const [focusVisible, setFocusVisible] = useState(false);

  return (
    <button
      type="button"
      className={styles.chip}
      aria-label={`Remove ${fileName}`}
      onClick={onRemove}
      onFocus={event =>
        setFocusVisible(event.currentTarget.matches(':focus-visible'))
      }
      onBlur={() => setFocusVisible(false)}
    >
      <span className={styles.fileIcon}>
        <FontAwesomeV6Icon iconName="file-csv" iconStyle="solid" />
      </span>
      <FullTextTooltip title={fileName} focused={focusVisible} placement="top">
        <Typography component="span" variant="label2" className={styles.name}>
          {fileName}
        </Typography>
      </FullTextTooltip>
      <FontAwesomeV6Icon
        iconName="xmark"
        iconStyle="solid"
        className={styles.removeIcon}
      />
    </button>
  );
};

export default UploadedFileChip;
