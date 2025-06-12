import {Button} from '@code-dot-org/component-library/button';
import Checkbox from '@code-dot-org/component-library/checkbox';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React, {memo, useEffect, useRef, useState} from 'react';

import lab2I18n from '@cdo/apps/lab2/locale';

import {getFileUrl} from './api';
import {IMAGE_DIMENSION_WARNING, PDF_PAGE_WARNING} from './constants';
import {AssetData} from './types';
import {getPageCount} from './utils';

import styles from './starter-assets-dialog.module.scss';

interface FileIconProps extends AssetData {
  levelName: string;
  onSelect?: (selected: boolean) => void;
  selected?: boolean;
  canSelect?: boolean;
  onDelete?: (filename: string) => void;
  showWarnings?: boolean;
}

const FileIcon: React.FC<FileIconProps> = ({
  filename,
  size,
  category,
  timestamp,
  levelName,
  onSelect,
  canSelect = true,
  selected,
  onDelete,
  showWarnings = false,
}) => {
  const url = `${getFileUrl(filename, levelName)}?${timestamp}`;
  const [pageCount, setPageCount] = useState<number>();
  const [dimensions, setDimensions] = useState<[number, number]>();
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  useEffect(() => {
    if (filename.endsWith('.pdf')) {
      getPageCount(url).then(count => {
        setPageCount(count);
        setLoadingMetadata(false);
      });
    }
  }, [url, filename]);

  const imgRef = useRef<HTMLImageElement>(null);
  const onImgLoad = () => {
    setDimensions([
      imgRef.current?.naturalWidth || 0,
      imgRef.current?.naturalHeight || 0,
    ]);
    setLoadingMetadata(false);
  };
  const [width, height] = dimensions || [];

  // Large PDF and image warnings are currently levelbuilder only,
  // so they are not translated.
  return (
    <div className={styles.fileIconWrapper}>
      {onSelect && !loadingMetadata && (
        <Checkbox
          checked={selected || false}
          onChange={event => onSelect(event.target.checked)}
          name={`select-${filename}`}
          size="s"
          disabled={!selected && !canSelect}
        />
      )}
      {onDelete && !loadingMetadata && (
        <Button
          size="xs"
          isIconOnly={true}
          onClick={() => onDelete(filename)}
          icon={{iconName: 'trash'}}
          color="destructive"
          type="secondary"
        />
      )}
      {loadingMetadata && (
        <div className={styles.loadingIcon}>
          <FontAwesomeV6Icon iconName="spinner" animationType={'spin'} />
        </div>
      )}
      <button
        className={styles[`file-icon-${category}`]}
        type="button"
        onClick={() => window.open(url, '_blank')}
      >
        {category === 'image' && (
          <img onLoad={onImgLoad} ref={imgRef} src={url} alt={filename} />
        )}
        {category === 'pdf' && (
          <div className={styles.pdfIcon}>
            <FontAwesomeV6Icon iconName="file" />
          </div>
        )}
        <div className={styles.fileInfo}>
          <BodyThreeText className={styles.filename}>
            {truncateFilename(filename)}
          </BodyThreeText>
          <BodyThreeText className={styles.fileSize}>
            {getSizeText(size)}
          </BodyThreeText>
          {pageCount && (
            <div className={styles.fileInfoRow}>
              <BodyThreeText className={styles.fileDetail}>
                {pageCount}{' '}
                {pageCount === 1 ? lab2I18n.page() : lab2I18n.pages()}
              </BodyThreeText>
              {showWarnings && pageCount > PDF_PAGE_WARNING && (
                <WarningIcon text="This PDF has many pages and may result in degraded performance." />
              )}
            </div>
          )}
          {width && height && (
            <div className={styles.fileInfoRow}>
              <BodyThreeText className={styles.fileDetail}>
                {width} x {height}
              </BodyThreeText>
              {showWarnings &&
                (width > IMAGE_DIMENSION_WARNING ||
                  height > IMAGE_DIMENSION_WARNING) && (
                  <WarningIcon text="This image is large and may result in degraded performance." />
                )}
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

const MAX_CHARACTERS = 20;

function truncateFilename(filename: string) {
  if (filename.length < MAX_CHARACTERS) {
    return filename;
  }

  return (
    filename.substring(0, MAX_CHARACTERS - 10) +
    '...' +
    filename.substring(filename.length - 7, filename.length)
  );
}

function getSizeText(size: number) {
  if (size < 1000) {
    return `${size} B`;
  } else if (size < 1000000) {
    return `${Math.round(size / 1000)} KB`;
  } else {
    return `${Math.round(size / 1000000)} MB`;
  }
}

const WarningIcon: React.FC<{text: string}> = ({text}) => (
  <WithTooltip
    tooltipProps={{
      text,
      tooltipId: 'warning-tooltip',
      direction: 'onTop',
      size: 'xs',
    }}
  >
    <FontAwesomeV6Icon
      className={styles.warningIcon}
      iconName="triangle-exclamation"
    />
  </WithTooltip>
);

export default memo(FileIcon);
