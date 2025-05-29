import {Button} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {memo} from 'react';

import {getFileUrl} from './api';
import {AssetData} from './types';

import styles from './starter-assets-dialog.module.scss';

interface FileIconProps {
  asset: AssetData;
  levelName: string;
  onSelect?: (selected: boolean) => void;
  selected?: boolean;
  canSelect?: boolean;
  onDelete?: () => void;
}

const FileIcon: React.FC<FileIconProps> = ({
  asset,
  levelName,
  onSelect,
  canSelect = true,
  selected,
  onDelete,
}) => {
  const {filename, category, timestamp} = asset;
  const url = `${getFileUrl(filename, levelName)}?${timestamp}`;
  return (
    <div className={styles.fileIconWrapper}>
      {onSelect && (
        <Checkbox
          checked={selected || false}
          onChange={event => onSelect(event.target.checked)}
          name={`select-${filename}`}
          size="s"
          disabled={!selected && !canSelect}
        />
      )}
      {onDelete && (
        <Button
          size="xs"
          isIconOnly={true}
          onClick={onDelete}
          icon={{iconName: 'trash'}}
          color="destructive"
          type="secondary"
        />
      )}
      <button
        className={styles[`file-icon-${category}`]}
        type="button"
        onClick={() => window.open(url, '_blank')}
      >
        {category === 'image' && <img src={url} alt={filename} />}
        {category === 'pdf' && (
          <div className={styles.pdfIcon}>
            <FontAwesomeV6Icon iconName="file" />
          </div>
        )}
        <BodyThreeText className={styles.filename}>
          {truncateFilename(filename)}
        </BodyThreeText>
      </button>
    </div>
  );
};

const MAX_CHARACTERS = 35;

function truncateFilename(filename: string) {
  if (filename.length < MAX_CHARACTERS) {
    return filename;
  }

  return (
    filename.substring(0, 20) +
    '...' +
    filename.substring(filename.length - 10, filename.length)
  );
}

export default memo(FileIcon);
