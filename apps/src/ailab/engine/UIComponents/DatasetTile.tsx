import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import styles from './datasetTile.module.scss';

interface DatasetTileProps {
  name: string;
  imageSrc: string | undefined;
  rowCount: number;
  isSelected: boolean;
  onClick: () => void;
}

const DatasetTile = ({
  name,
  imageSrc,
  rowCount,
  isSelected,
  onClick,
}: DatasetTileProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      className={classNames(styles.tile, {[styles.selected]: isSelected})}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <span className={styles.cover}>
        {imageSrc && !imageFailed ? (
          <img
            src={imageSrc}
            draggable={false}
            className={classNames('uitest-ailab-dataset-image', styles.image)}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <FontAwesomeV6Icon
            iconName="table"
            iconStyle="regular"
            className={styles.placeholderIcon}
            aria-hidden="true"
          />
        )}
        {isSelected && (
          <span className={styles.selectedMark}>
            <FontAwesomeV6Icon
              iconName="check"
              iconStyle="solid"
              aria-hidden="true"
            />
          </span>
        )}
      </span>
      <span className={styles.label}>
        <Typography component="span" variant="label2" className={styles.name}>
          {name}
        </Typography>
        <Typography component="span" variant="body4" className={styles.rows}>
          {`${rowCount.toLocaleString('en')} rows`}
        </Typography>
      </span>
    </button>
  );
};

export default DatasetTile;
