import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {StrongText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';

import styles from './staged-files-preview.module.scss';

const FilePreview: React.FC<{
  type: 'pdf' | 'image';
  filename: string;
  url: string;
  isUploading?: boolean;
  onRemove?: () => void;
}> = ({type, filename, url, isUploading, onRemove}) => {
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

    if (imageElement.complete) {
      handleLoad();
    } else {
      imageElement.addEventListener('load', handleLoad);
    }

    return () => {
      imageElement.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <div className={styles[`preview-${type}`]} title={filename}>
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
          <img
            alt=""
            src={url}
            ref={imageRef}
            className={(!imageLoaded && styles.hide) || undefined}
          />
        </div>
      ) : (
        <>
          <div className={styles.fileIcon}>
            <FontAwesomeV6Icon iconName="file" />
          </div>
          <div className={styles.filenameContainer}>
            <StrongText>{filename}</StrongText>
            <span>PDF</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FilePreview;
