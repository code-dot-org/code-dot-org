import Alert from '@code-dot-org/component-library/alert';
import {Button, LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Typography from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import QRCode from 'qrcode.react';
import React, {useCallback, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import DCDO from '@cdo/apps/dcdo';
import {ProjectType} from '@cdo/apps/lab2/types';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {SubmissionStatusType} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import trackEvent from '@cdo/apps/util/trackEvent';
import {ProjectSubmissionStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import moduleStyles from './share-dialog.module.scss';

const TEACHER_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSflGeMmY_ff1QllJfpTsWGZdn_xv6dKpPba_evTMwfbvG3FTA/viewform';
const STUDENT_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSeZGNgX4wDvA29stId_Q2toofJN-r12zSP8yBMZ-E9KW5XPWg/viewform';

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
      className={moduleStyles.shareDialogButton}
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
      <div className={moduleStyles.afeText}>{i18n.careerTourDescription()}</div>
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
        className={moduleStyles.shareDialogButton}
      />
    </div>
  );
};

const SubmitButtonInfo: React.FunctionComponent<{
  submissionStatus: SubmissionStatusType | undefined;
  onSubmitClick: () => void;
}> = ({submissionStatus, onSubmitClick}) => {
  const lab2SubmitProjectEnabled = DCDO.get(
    'lab2-submit-project-enabled',
    true
  ) as boolean;
  if (!lab2SubmitProjectEnabled) {
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
        className={moduleStyles.shareDialogButton}
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

  const feedbackLink = useAppSelector(state => {
    const {userType, signInState} = state.currentUser;
    if (signInState !== SignInState.SignedIn) return undefined;
    return userType === 'teacher'
      ? TEACHER_FEEDBACK_LINK
      : STUDENT_FEEDBACK_LINK;
  });

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
            {feedbackLink && finishUrl && (
              <a
                href={feedbackLink}
                target="_blank"
                rel="noopener noreferrer"
                className={moduleStyles.feedbackLink}
                aria-label={i18n.feedbackHeader()}
              >
                {i18n.feedbackHeader()}
              </a>
            )}
            <div className={moduleStyles.buttonGroup}>
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
