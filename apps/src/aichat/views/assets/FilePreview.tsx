import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {StrongText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';

import styles from './staged-files-preview.module.scss';

const FilePreview: React.FC<{
  type: 'pdf' | 'image' | 'text';
  filename: string;
  fileDetail?: string | number;
  url?: string;
  isUploading?: boolean;
  onRemove?: () => void;
  onLoadError?: () => void;
}> = ({
  type,
  filename,
  fileDetail,
  url,
  isUploading,
  onRemove,
  onLoadError,
}) => {
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

  const getFileExtension = (filename: string): string => {
    const extension = filename.split('.').pop();
    return filename.includes('.') && extension ? extension : 'TEXT';
  };
  const fileExtension = getFileExtension(filename);

  const getFileIconName = (extension: string): string => {
    switch (extension) {
      case 'css':
        return 'css';
      case 'csv':
        return 'file-csv';
      case 'html':
        return 'file-code';
      case 'js':
        return 'js';
      case 'md':
        return 'markdown';
      case 'pdf':
        return 'file-pdf';
      case 'txt':
      case 'TEXT':
        return 'file-lines';
      default:
        return 'file';
    }
  };

  const getFileIconFamily = (
    extension: string
  ): FontAwesomeV6IconProps['iconFamily'] => {
    return ['css', 'js', 'md'].includes(extension) ? 'brands' : undefined;
  };

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
            <FontAwesomeV6Icon
              iconName={getFileIconName(fileExtension)}
              iconFamily={getFileIconFamily(fileExtension)}
            />
          </div>
          <div className={styles.filenameContainer}>
            <StrongText>{filename}</StrongText>
            <span className={styles.fileDetail}>
              {[
                type === 'pdf' ? 'PDF' : null,
                type === 'text' ? fileExtension.toUpperCase() : null,
                fileDetail ? fileDetail : null,
              ]
                .filter(Boolean)
                .join(' ')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default FilePreview;
