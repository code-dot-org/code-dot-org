import classNames from 'classnames';
import QRCode from 'qrcode.react';
import React, {useCallback, useEffect, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {Button, LinkButton} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography';
import {ProjectType} from '@cdo/apps/lab2/types';
import {setShowSubmitProjectDialog} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectRedux';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
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
    <Button
      iconLeft={{
        iconName: copiedToClipboard ? 'clipboard-check' : 'clipboard',
      }}
      ariaLabel={i18n.copyLinkToProject()}
      text={i18n.copyLinkToProject()}
      type="secondary"
      color="white"
      size="m"
      onClick={handleCopyToClipboard}
      className={moduleStyles.copyLinkButton}
    />
  );
};

const AfeCareerTourBlock: React.FunctionComponent = () => {
  const careersUrl =
    'https://www.amazonfutureengineer.com/careertours/careervideos';

  return (
    <div className={classNames(moduleStyles.block, moduleStyles.blockAfe)}>
      <Typography
        semanticTag="h2"
        visualAppearance="heading-md"
        className={moduleStyles.heading}
      >
        {i18n.careerTourTitle()}
      </Typography>
      <img alt="" src="/shared/images/afe/afe-career-tours-0.jpg" />
      {i18n.careerTourDescription()}
      <LinkButton
        ariaLabel={i18n.careerTourAction()}
        href={careersUrl}
        text={i18n.careerTourAction()}
        type="primary"
        color="white"
        size="m"
        target="_blank"
        iconRight={{
          iconName: 'arrow-up-right-from-square',
          iconStyle: 'solid',
          title: 'arrow-up-right-from-square',
        }}
        className={moduleStyles.fullWidth}
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

  const submissionStatus = useAppSelector(
    state => state.submitProject.submissionStatus
  );
  console.log('submissionStatus', submissionStatus);
  const showSubmitButton = submissionStatus === 0;
  const submitButtonText = 'Submit to be featured';

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
          <div>{dialogId === 'hoc2024' && i18n.congratsFinishedHoc()}</div>
          <div className={moduleStyles.columns}>
            <div className={moduleStyles.column}>
              <div className={moduleStyles.block}>
                {dialogId === 'hoc2024' && (
                  <Typography
                    semanticTag="h2"
                    visualAppearance="heading-md"
                    className={moduleStyles.heading}
                  >
                    {i18n.shareTitle()}
                  </Typography>
                )}
                <div
                  className={moduleStyles.QRCodeContainer}
                  id="share-qrcode-container"
                >
                  <div className={moduleStyles.QRCodeBorder}>
                    <QRCode value={shareUrl + '?qr=true'} size={117} />
                  </div>
                </div>
                <CopyToClipboardButton
                  shareUrl={shareUrl}
                  projectType={projectType}
                />
              </div>
            </div>
            {dialogId === 'hoc2024' && (
              <div className={moduleStyles.column}>
                <AfeCareerTourBlock />
              </div>
            )}
          </div>
          <div className={moduleStyles.bottom}>
            {showSubmitButton && (
              <Button
                text={submitButtonText}
                type="primary"
                size="m"
                onClick={() => {
                  console.log('submit project');
                  dispatch(hideShareDialog());
                  dispatch(setShowSubmitProjectDialog(true));
                }}
              />
            )}
            {finishUrl ? (
              <div className={moduleStyles.contents}>
                <Button
                  ariaLabel={i18n.keepPlaying()}
                  text={i18n.keepPlaying()}
                  type="secondary"
                  color="white"
                  size="m"
                  onClick={handleClose}
                  className={moduleStyles.keepPlayingButton}
                />
                <LinkButton
                  ariaLabel={i18n.finish()}
                  href={finishUrl}
                  text={i18n.finish()}
                  type="primary"
                  color="white"
                  size="m"
                  className={moduleStyles.doneButton}
                />
              </div>
            ) : (
              <Button
                ariaLabel={i18n.done()}
                text={i18n.done()}
                type="primary"
                color="white"
                size="m"
                onClick={handleClose}
                className={moduleStyles.doneButton}
              />
            )}
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
