import classNames from 'classnames';
import {QRCodeSVG} from 'qrcode.react';
import React, {useCallback, useState} from 'react';
import FocusLock from 'react-focus-lock';

import Alert from '@code-dot-org/component-library/alert';
import {Button, LinkButton} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Typography from '@code-dot-org/component-library/typography';
import {GoogleAnalytics, analyticsReporter, EVENTS, DCDO} from '@code-dot-org/metrics';
import type {ProjectType} from '@code-dot-org/projects';

import {TEACHER_FEEDBACK_LINK, STUDENT_FEEDBACK_LINK, ProjectSubmissionStatus} from '@lab-base/constants';
import {useShare} from '@lab-base/contexts';

import {useAppSelector} from '../../redux/store';

import moduleStyles from './share-dialog.module.scss';

type ValueOf<T> = T[keyof T];
type SubmissionStatusType = ValueOf<typeof ProjectSubmissionStatus>;

const CopyToClipboardButton: React.FunctionComponent<{
  shareUrl: string;
  projectType: ProjectType;
  channelId?: string;
}> = ({shareUrl, projectType, channelId}) => {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedToClipboard(true);
    });
    GoogleAnalytics.trackEvent('share', 'share_copy_url', {value: projectType});
    analyticsReporter.sendEvent(
      EVENTS.SHARING_LINK_COPY,
      {
        lab_type: projectType,
        ...(channelId ? {
          channel_id: channelId,
        } : {}),
      }
    );
  }, [shareUrl, projectType, channelId]);

  return (
    <Button
      iconLeft={{
        iconName: copiedToClipboard ? 'clipboard-check' : 'clipboard',
      }}
      ariaLabel="Copy link to project"
      text="Copy link to project"
      type="secondary"
      color="black"
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
        Take a career tour
      </Typography>
      <img alt="" src="/shared/images/afe/afe-career-tours-0.jpg" />
      <div className={moduleStyles.afeText}>Explore more careers in tech and music with Amazon.</div>
      <LinkButton
        ariaLabel="Take a tour"
        href={careersUrl}
        text="Take a tour"
        type="primary"
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
        text="Submit to be featured"
        type="secondary"
        color="black"
        size="m"
        onClick={onSubmitClick}
        className={moduleStyles.shareDialogButton}
      />
    );
  } else if (submissionStatus === ProjectSubmissionStatus.ALREADY_SUBMITTED) {
    return (
      <Alert
        text="Submitted"
        type="success"
        size="s"
        className={moduleStyles.alert}
      />
    );
  }
  return null;
};

export interface ShareDialogProps {
  dialogId?: string;
  shareUrl: string;
  finishUrl?: string;
  projectType: ProjectType;
  onSubmitClick: () => void;
  submissionStatus: SubmissionStatusType | undefined;
  channelId: string;
  userSharingDisabled: boolean | undefined;
}

/**
 * A new implementation of the project share dialog for Lab2 labs.  Currently only used
 * by Music Lab and Python Lab, and only supports a minimal subset of functionality.
 */
const ShareDialog: React.FunctionComponent<ShareDialogProps> = ({
  dialogId,
  shareUrl,
  finishUrl,
  projectType,
  onSubmitClick,
  submissionStatus,
  channelId,
  userSharingDisabled,
}) => {
  const {hideShareDialog} = useShare();
  const sharingDisabled = () =>
    userSharingDisabled && ['pythonlab', 'weblab2'].includes(projectType);

  const handleClose = useCallback(() => {
    hideShareDialog();
    analyticsReporter.sendEvent(
      EVENTS.SHARING_CLOSE_ESCAPE,
      {
        lab_type: projectType,
        channel_id: channelId,
      }
    );
  }, [channelId, hideShareDialog, projectType]);

  const userType = useAppSelector(state => state.currentUser.userType);

  const feedbackLink = userType === 'teacher'
      ? TEACHER_FEEDBACK_LINK
      : STUDENT_FEEDBACK_LINK;

  const {theme} = useTheme();

  return sharingDisabled() ? (
    <Dialog
      title="Sorry, this project is not available for sharing. If this is your project or the project of one of your students, please [sign in]({sign_in_url}) to your account to view the project."
      description="Sorry, you do not have permissions to share this project. If you want to be able to share your project, please ask your teacher to enable sharing of open-ended project types for your section from the 'Manage students' tab in their dashboard. They can do this by adding the project sharing column from the Actions settings menu."
      mode={theme === 'Light' ? 'light' : 'dark'}
      primaryButtonProps={{
        onClick: () => hideShareDialog(),
        text: "OK",
      }}
    />
  ) : (
    <FocusLock>
      <div className={moduleStyles.dialogContainer} data-theme={theme}>
        <div id="share-dialog" className={moduleStyles.shareDialog}>
          <Typography
            semanticTag="h1"
            visualAppearance="heading-lg"
            className={moduleStyles.heading}
          >
            {dialogId === 'hoc2024'
              ? "Congratulations!"
              : "Share your project"}
          </Typography>
          <div>{dialogId === 'hoc2024' && "You finished this Hour of Code activity. What's next?"}</div>
          <div className={moduleStyles.columns}>
            <div className={moduleStyles.column}>
              <div className={moduleStyles.block}>
                {dialogId === 'hoc2024' && (
                  <Typography
                    semanticTag="h2"
                    visualAppearance="heading-md"
                    className={moduleStyles.heading}
                  >
                    Share your project
                  </Typography>
                )}
                <div
                  className={moduleStyles.QRCodeContainer}
                  id="share-qrcode-container"
                >
                  <div className={moduleStyles.QRCodeBorder}>
                    <QRCodeSVG value={shareUrl + '?qr=true'} size={117} />
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
                aria-label="Give feedback"
              >
                Give Feedback
              </a>
            )}
            <div className={moduleStyles.buttonGroup}>
              {finishUrl ? (
                <div className={moduleStyles.contents}>
                  <Button
                    ariaLabel="Keep playing"
                    text="Keep playing"
                    type="secondary"
                    color="black"
                    size="m"
                    onClick={handleClose}
                    className={moduleStyles.keepPlayingButton}
                  />
                  <LinkButton
                    ariaLabel="Finish"
                    href={finishUrl}
                    text="Finish"
                    type="primary"
                    size="m"
                  />
                </div>
              ) : (
                <Button
                  ariaLabel="Done"
                  text="Done"
                  type="primary"
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
