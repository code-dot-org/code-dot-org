import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {useFocusVisible} from '../useFocusVisible';

import FullTextTooltip from './FullTextTooltip';

import styles from './uploadedFileChip.module.scss';

interface UploadedFileChipProps {
  fileName: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const UploadedFileChip = ({
  fileName,
  isSelected,
  onSelect,
  onRemove,
}: UploadedFileChipProps) => {
  const {focusVisible, focusHandlers} = useFocusVisible();

  return (
    <div className={classNames(styles.chip, {[styles.selected]: isSelected})}>
      <button
        type="button"
        className={styles.select}
        aria-pressed={isSelected}
        onClick={onSelect}
        {...focusHandlers}
      >
        <span className={styles.fileIcon}>
          <FontAwesomeV6Icon iconName="file-csv" aria-hidden="true" />
        </span>
        <FullTextTooltip
          title={fileName}
          focused={focusVisible}
          placement="top"
        >
          <Typography component="span" variant="label2" className={styles.name}>
            {fileName}
          </Typography>
        </FullTextTooltip>
      </button>
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remove ${fileName}`}
        onClick={onRemove}
      >
        <FontAwesomeV6Icon iconName="xmark" aria-hidden="true" />
      </button>
    </div>
  );
};

export default UploadedFileChip;
