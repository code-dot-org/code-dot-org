import QRCode from 'qrcode.react';
import React, {useCallback, useEffect, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography';
import {ProjectType} from '@cdo/apps/lab2/types';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import trackEvent from '@cdo/apps/util/trackEvent';
import i18n from '@cdo/locale';

import moduleStyles from './ShareDialog.module.scss';

const CopyToClipboardButton: React.FunctionComponent<{
  shareUrl: string;
  projectType: ProjectType;
}> = ({shareUrl, projectType}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard(shareUrl, () => {
      setCopiedToClipboard(true);
    });
    trackEvent('share', 'share_copy_url', {value: projectType});
  }, [shareUrl, projectType]);

  return (
    <button
      type="button"
      onClick={handleCopyToClipboard}
      className={moduleStyles.copyToClipboard}
    >
      <FontAwesomeV6Icon
        iconName={copiedToClipboard ? 'clipboard-check' : 'clipboard'}
        iconStyle="thin"
        className={moduleStyles.copyToClipboardIcon}
      />
      {i18n.copyLinkToProject()}
    </button>
  );
};

/**
 * A new implementation of the project share dialog for Lab2 labs.  Currently only used
 * by Music Lab and Python Lab, and only supports a minimal subset of functionality.
 */
const ShareDialog: React.FunctionComponent<{
  shareUrl: string;
  projectType: ProjectType;
}> = ({shareUrl, projectType}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    trackEvent('share', 'share_open_dialog', {value: projectType});
  });

  const handleClose = useCallback(
    () => dispatch(hideShareDialog()),
    [dispatch]
  );

  return (
    <FocusLock>
      <div className={moduleStyles.dialogContainer}>
        <div id="share-dialog" className={moduleStyles.shareDialog}>
          <Typography semanticTag="h1" visualAppearance="heading-lg">
            {i18n.shareTitle()}
          </Typography>
          <div className={moduleStyles.itemsContainer}>
            <CopyToClipboardButton
              shareUrl={shareUrl}
              projectType={projectType}
            />
            <div id="share-qrcode-container">
              <QRCode value={shareUrl + '?qr=true'} size={140} />
            </div>
          </div>
          <button
            type="button"
            className={moduleStyles.closeButton}
            onClick={handleClose}
          >
            <FontAwesomeV6Icon
              iconName={'xmark'}
              iconStyle="thin"
              className={moduleStyles.closeButtonIcon}
            />
          </button>
        </div>
      </div>
    </FocusLock>
  );
};

export default ShareDialog;
