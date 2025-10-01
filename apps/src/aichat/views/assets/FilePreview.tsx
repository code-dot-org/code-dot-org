import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {StrongText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';

import styles from './staged-files-preview.module.scss';

const FilePreview: React.FC<{
  type: 'pdf' | 'image' | 'text';
  filename: string;
  url?: string;
  isUploading?: boolean;
  onRemove?: () => void;
  onLoadError?: () => void;
}> = ({type, filename, url, isUploading, onRemove, onLoadError}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) {
      return;
    }

    const handleLoad = () => {
      setImageLoaded(true);
    };

    const handleError = () => {
      setImageLoaded(true);
      onLoadError?.();
    };

    if (imageElement.complete) {
      handleLoad();
    } else {
      imageElement.addEventListener('load', handleLoad);
      imageElement.addEventListener('error', handleError);
    }

    return () => {
      imageElement.removeEventListener('load', handleLoad);
      imageElement.removeEventListener('error', handleError);
    };
  }, [url, onLoadError]);
  const previewType = type === 'image' ? 'image' : 'file';

  return (
    <div className={styles[`preview-${previewType}`]} title={filename}>
      {onRemove ? (
        isUploading || (type === 'image' && !imageLoaded) ? (
          <FontAwesomeV6Icon
            className={styles.topRightIcon}
            iconName={'circle-notch'}
            animationType={'spin'}
          />
        ) : (
          <WithTooltip
            tooltipProps={{
              tooltipId: 'close-button',
              direction: 'onTop',
              size: 'xs',
              text: aichatI18n.remove(),
              className: styles.closeTooltip,
            }}
            tooltipOverlayClassName={styles.closeTooltipOverlay}
          >
            <button
              className={classNames(
                styles.topRightIcon,
                styles.topRightIconClose
              )}
              type="button"
              onClick={onRemove}
            >
              <FontAwesomeV6Icon iconName={'circle-xmark'} />
            </button>
          </WithTooltip>
        )
      ) : null}
      {type === 'image' ? (
        <div
          className={!imageLoaded ? styles['preview-image-loading'] : undefined}
        >
          {!isUploading && (
            <img
              alt=""
              src={url}
              ref={imageRef}
              className={(!imageLoaded && styles.hide) || undefined}
            />
          )}
        </div>
      ) : (
        <>
          <div className={styles.fileIcon}>
            <FontAwesomeV6Icon iconName="file" />
          </div>
          <div className={styles.filenameContainer}>
            <StrongText>{filename}</StrongText>
            {type === 'pdf' && <span>PDF</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default FilePreview;
