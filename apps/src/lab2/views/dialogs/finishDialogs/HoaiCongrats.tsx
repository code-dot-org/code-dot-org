import {Theme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import Typography from '@code-dot-org/component-library/typography';
import QRCode from 'qrcode.react';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';
import {ProjectType} from '@cdo/apps/lab2/types';

import {CopyToClipboardButton} from '../CopyToClipboardButton';

import styles from './hoai-congrats.module.scss';

const key = 'hoai2025-share-enabled';
const shareEnabled = DCDO.get(key, false) || queryParams(key) === 'true';

interface Props {
  handleClose: () => void;
  finishUrl: string;
  shareUrl: string;
  projectType: ProjectType;
  channelId: string | undefined;
  theme?: Theme;
}

/**
 * Congrats dialog shown for Hour of AI activities.
 */
const HoaiCongrats: React.FC<Props> = ({
  handleClose,
  finishUrl,
  shareUrl,
  theme,
  projectType,
  channelId,
}) => {
  return (
    <Modal
      data-theme={theme}
      title="Congratulations!"
      description="You finished this Hour of AI activity. What's next?"
      primaryButtonProps={{text: 'Finish', href: finishUrl, useAsLink: true}}
      secondaryButtonProps={{text: 'Keep Playing', onClick: handleClose}}
      customContent={
        shareEnabled && (
          <div className={styles.shareContainer}>
            <div className={styles.block}>
              <Typography semanticTag="h2" visualAppearance="heading-md">
                Share your project
              </Typography>
              <div className={styles.qrCode} id="share-qrcode-container">
                <QRCode
                  value={shareUrl + '?qr=true'}
                  size={parseInt(styles.qrCodeSize)}
                />
              </div>
              <CopyToClipboardButton
                shareUrl={shareUrl}
                projectType={projectType}
                channelId={channelId}
              />
            </div>
          </div>
        )
      }
    />
  );
};

export default HoaiCongrats;
