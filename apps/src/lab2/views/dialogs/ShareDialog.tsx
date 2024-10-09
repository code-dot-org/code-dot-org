import QRCode from 'qrcode.react';
import React, {useCallback, useEffect, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {Button, LinkButton} from '@cdo/apps/componentLibrary/button';
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
    <div>
      <Button
        iconLeft={{
          iconName: copiedToClipboard ? 'clipboard-check' : 'clipboard',
        }}
        ariaLabel={i18n.copyLinkToProject()}
        text={i18n.copyLinkToProject()}
        type="primary"
        color="black"
        size="m"
        onClick={handleCopyToClipboard}
      />
    </div>
  );
};

/**
 * A new implementation of the project share dialog for Lab2 labs.  Currently only used
 * by Music Lab and Python Lab, and only supports a minimal subset of functionality.
 */

const ShareDialog: React.FunctionComponent<{
  dialogId?: string;
  shareUrl: string;
  finishUrl?: string;
  projectType: ProjectType;
}> = ({dialogId, shareUrl, finishUrl, projectType}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    trackEvent('share', 'share_open_dialog', {
      value:
        dialogId === 'hoc2024'
          ? 'share_open_dialog_congrats_hoc2024'
          : projectType,
    });
  });

  const handleClose = useCallback(
    () => dispatch(hideShareDialog()),
    [dispatch]
  );

  const careersUrl =
    'https://www.amazonfutureengineer.com/careertours/careervideos';

  return (
    <FocusLock>
      <div className={moduleStyles.dialogContainer}>
        <div id="share-dialog" className={moduleStyles.shareDialog}>
          <Typography
            semanticTag="h1"
            visualAppearance="heading-lg"
            className={moduleStyles.heading}
          >
            {dialogId === 'hoc2024'
              ? i18n.congratulations()
              : i18n.shareTitle()}
          </Typography>
          <div className={moduleStyles.columns}>
            <div className={moduleStyles.column}>
              <div className={moduleStyles.share}>
                <div id="share-qrcode-container">
                  <QRCode value={shareUrl + '?qr=true'} size={140} />
                </div>
                <CopyToClipboardButton
                  shareUrl={shareUrl}
                  projectType={projectType}
                />
              </div>
            </div>
            <div className={moduleStyles.column}>
              {dialogId === 'hoc2024' ? (
                <div className={moduleStyles.careers}>
                  Learn more about careers in technology and music.
                  <LinkButton
                    ariaLabel={i18n.learnMore()}
                    href={careersUrl}
                    text={i18n.learnMore()}
                    type="primary"
                    color="black"
                    size="m"
                    target="_blank"
                  />
                </div>
              ) : (
                <div>Share your project by using these links.</div>
              )}

              {finishUrl ? (
                <LinkButton
                  ariaLabel={i18n.finish()}
                  href={finishUrl}
                  text={i18n.finish()}
                  type="primary"
                  size="m"
                  className={moduleStyles.doneButton}
                />
              ) : (
                <Button
                  ariaLabel={i18n.done()}
                  text={i18n.done()}
                  type="primary"
                  size="m"
                  onClick={handleClose}
                  className={moduleStyles.doneButton}
                />
              )}
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
