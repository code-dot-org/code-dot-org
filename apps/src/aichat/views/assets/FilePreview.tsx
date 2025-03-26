import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {StrongText} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import aichatI18n from '@cdo/apps/aichat/locale';

import styles from './staged-files-preview.module.scss';

const FilePreview: React.FC<{
  type: 'pdf' | 'image';
  filename: string;
  url: string;
  isLoading?: boolean;
  onRemove?: () => void;
}> = ({type, filename, url, isLoading, onRemove}) => {
  return (
    <div
      className={styles[`preview-${type}`]}
      title={filename}
      style={
        !isLoading && type === 'image' ? {backgroundImage: `url('${url}')`} : {}
      }
    >
      {onRemove ? (
        isLoading ? (
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
      {type === 'pdf' && (
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
