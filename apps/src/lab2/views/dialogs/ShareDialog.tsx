import classNames from 'classnames';
import QRCode from 'qrcode.react';
import React, {useCallback, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button, LinkButton} from '@cdo/apps/componentLibrary/button';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import Typography from '@cdo/apps/componentLibrary/typography';
import {ProjectType} from '@cdo/apps/lab2/types';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {SubmissionStatusType} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import trackEvent from '@cdo/apps/util/trackEvent';
import {ProjectSubmissionStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import moduleStyles from './share-dialog.module.scss';

const CopyToClipboardButton: React.FunctionComponent<{
  shareUrl: string;
  projectType: ProjectType;
  channelId: string | undefined;
}> = ({shareUrl, projectType, channelId}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopyToClipboard = useCallback(() => {
    copyToClipboard(shareUrl, () => {
      setCopiedToClipboard(true);
    });
    trackEvent('share', 'share_copy_url', {value: projectType});
    analyticsReporter.sendEvent(
      EVENTS.SHARING_LINK_COPY,
      {
        lab_type: projectType,
        channel_id: channelId,
      },
      PLATFORMS.STATSIG
    );
  }, [shareUrl, projectType, channelId]);

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
      className={moduleStyles.projectButton}
    />
  );
};

const AfeCareerTourBlock: React.FunctionComponent = () => {
  const careersUrl =
    'https://www.amazonfutureengineer.com/musicsolo?utm_campaign=Code.Org&utm_medium=Musiclab&utm_source=US&utm_content=Career%20Tours&utm_term=2024';

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

const SubmitButtonInfo: React.FunctionComponent<{
  submissionStatus: SubmissionStatusType | undefined;
  onSubmitClick: () => void;
}> = ({submissionStatus, onSubmitClick}) => {
  if (
    !experiments.isEnabledAllowingQueryString(experiments.LAB2_SUBMIT_PROJECT)
  ) {
    return null;
  }
  if (submissionStatus === ProjectSubmissionStatus.CAN_SUBMIT) {
    return (
      <Button
        iconLeft={{iconName: 'award'}}
        text={i18n.submitProjectGallery_header()}
        type="secondary"
        color="white"
        size="m"
        onClick={onSubmitClick}
        className={moduleStyles.projectButton}
      />
    );
  } else if (submissionStatus === ProjectSubmissionStatus.ALREADY_SUBMITTED) {
    return (
      <Alert
        text={i18n.submitted()}
        type="success"
        size="s"
        className={moduleStyles.alert}
      />
    );
  }
  return null;
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
  onSubmitClick: () => void;
  submissionStatus: SubmissionStatusType | undefined;
  channelId: string;
}> = ({
  dialogId,
  shareUrl,
  finishUrl,
  projectType,
  onSubmitClick,
  submissionStatus,
  channelId,
}) => {
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch(hideShareDialog());
    analyticsReporter.sendEvent(
      EVENTS.SHARING_CLOSE_ESCAPE,
      {
        lab_type: projectType,
        channel_id: channelId,
      },
      PLATFORMS.STATSIG
    );
  }, [channelId, dispatch, projectType]);

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
                  channelId={channelId}
                />
                <SubmitButtonInfo
                  submissionStatus={submissionStatus}
                  onSubmitClick={onSubmitClick}
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
