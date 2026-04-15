import {Theme} from '@code-dot-org/component-library/common/contexts';
import Modal from '@code-dot-org/component-library/modal';
import {Typography} from '@mui/material';
import QRCode from 'qrcode.react';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';
import {ProjectType} from '@cdo/apps/lab2/types';

import {CopyToClipboardButton} from '../CopyToClipboardButton';

import styles from './hoai-congrats.module.scss';

const key = 'hoai2025-share-enabled';
const shareEnabled = DCDO.get(key, true) || queryParams(key) === 'true';

interface Props {
  handleClose: () => void;
  finishUrl: string;
  shareUrl: string;
  projectType: ProjectType;
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
}) => {
  return (
    <Modal
      data-theme={theme}
      title="Congratulations!"
      description="You finished this Hour of AI activity. What's next?"
      primaryButtonProps={{children: 'Finish', href: finishUrl}}
      secondaryButtonProps={{children: 'Keep Playing', onClick: handleClose}}
      customContent={
        shareEnabled && (
          <div className={styles.shareContainer}>
            <div className={styles.block}>
              <Typography component="h2" variant="h4" gutterBottom>
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
              />
            </div>
          </div>
        )
      }
    />
  );
};

export default HoaiCongrats;
