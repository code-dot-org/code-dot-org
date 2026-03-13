import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {Typography, Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import QRCode from 'qrcode.react';
import React, {useCallback} from 'react';
import FocusLock from 'react-focus-lock';

import {hideShareDialog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import DCDO from '@cdo/apps/dcdo';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProjectType, ShareDialogId} from '@cdo/apps/lab2/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {SubmissionStatusType} from '@cdo/apps/templates/projects/submitProjectDialog/submitProjectApi';
import {commonI18n as i18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {ProjectSubmissionStatus} from '@cdo/generated-scripts/sharedConstants';

import {CopyToClipboardButton} from './CopyToClipboardButton';
import HoaiCongrats from './finishDialogs/HoaiCongrats';

import moduleStyles from './share-dialog.module.scss';

const TEACHER_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSflGeMmY_ff1QllJfpTsWGZdn_xv6dKpPba_evTMwfbvG3FTA/viewform';
const STUDENT_FEEDBACK_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSeZGNgX4wDvA29stId_Q2toofJN-r12zSP8yBMZ-E9KW5XPWg/viewform';

const AfeCareerTourBlock: React.FunctionComponent = () => {
  const careersUrl =
    'https://www.amazonfutureengineer.com/musicsolo?utm_campaign=Code.Org&utm_medium=Musiclab&utm_source=US&utm_content=Career%20Tours&utm_term=2024';

  return (
    <div className={classNames(moduleStyles.block, moduleStyles.blockAfe)}>
      <Typography
        className={moduleStyles.heading}
        component="h2"
        variant="h4"
        gutterBottom
      >
        {i18n.careerTourTitle()}
      </Typography>
      <img alt="" src="/shared/images/afe/afe-career-tours-0.jpg" />
      <div className={moduleStyles.afeText}>{i18n.careerTourDescription()}</div>
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        className={moduleStyles.shareDialogButton}
        aria-label={i18n.careerTourAction()}
        href={careersUrl}
        rel="noopener noreferrer"
        target="_blank"
        endIcon={
          <FontAwesomeV6Icon
            iconName="arrow-up-right-from-square"
            iconStyle="solid"
            title="arrow-up-right-from-square"
          />
        }
      >
        {i18n.careerTourAction()}
      </MuiButton>
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
      <MuiButton
        variant="outlined"
        color="secondary"
        size="medium"
        className={moduleStyles.shareDialogButton}
        onClick={onSubmitClick}
        type="button"
        startIcon={<FontAwesomeV6Icon iconName="award" />}
      >
        {i18n.submitProjectGallery_header()}
      </MuiButton>
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
  dialogId?: ShareDialogId;
  shareUrl: string;
  finishUrl?: string;
  projectType: ProjectType;
  onSubmitClick: () => void;
  submissionStatus: SubmissionStatusType | undefined;
  channelId: string;
  userSharingDisabled: boolean | undefined;
}> = ({
  dialogId,
  shareUrl,
  finishUrl,
  projectType,
  onSubmitClick,
  submissionStatus,
  channelId,
  userSharingDisabled,
}) => {
  const dispatch = useAppDispatch();
  const sharingDisabled = () =>
    userSharingDisabled && ['pythonlab', 'weblab2'].includes(projectType);

  const handleClose = useCallback(() => {
    dispatch(hideShareDialog());
    analyticsReporter.sendEvent(EVENTS.SHARING_CLOSE_ESCAPE, {
      lab_type: projectType,
      channel_id: channelId,
    });
  }, [channelId, dispatch, projectType]);

  const feedbackLink = useAppSelector(state => {
    const {userType, signInState} = state.currentUser;
    if (signInState !== SignInState.SignedIn) return undefined;
    return userType === 'teacher'
      ? TEACHER_FEEDBACK_LINK
      : STUDENT_FEEDBACK_LINK;
  });

  // We pull the theme from Lab2Registry because the ShareDialog is not wrapped by the lab's
  // ThemeProvider (the header is in its own tree). We copy the lab theme to the registry
  // in Lab2Wrapper.
  const theme = Lab2Registry.getInstance().getTheme();

  if (finishUrl && dialogId === 'hoai2025') {
    return (
      <HoaiCongrats
        handleClose={handleClose}
        finishUrl={finishUrl}
        shareUrl={shareUrl}
        projectType={projectType}
        channelId={channelId}
        theme={theme}
      />
    );
  }

  return sharingDisabled() ? (
    <div data-theme={theme}>
      <Modal
        title={i18n.sharingDisabledTitle()}
        description={i18n.sharingBlockedByTeacherOpenEndedProjects()}
        primaryButtonProps={{
          onClick: () => dispatch(hideShareDialog()),
          text: i18n.ok(),
        }}
      />
    </div>
  ) : (
    <FocusLock>
      <div className={moduleStyles.dialogContainer} data-theme={theme}>
        <div id="share-dialog" className={moduleStyles.shareDialog}>
          <Typography
            className={moduleStyles.heading}
            component="h1"
            variant="h3"
            gutterBottom
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
                    className={moduleStyles.heading}
                    component="h2"
                    variant="h4"
                    gutterBottom
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
                  <MuiButton
                    variant="outlined"
                    color="secondary"
                    size="medium"
                    className={moduleStyles.keepPlayingButton}
                    onClick={handleClose}
                    aria-label={i18n.keepPlaying()}
                    type="button"
                  >
                    {i18n.keepPlaying()}
                  </MuiButton>
                  <MuiButton
                    variant="contained"
                    color="primary"
                    size="medium"
                    aria-label={i18n.finish()}
                    href={finishUrl}
                  >
                    {i18n.finish()}
                  </MuiButton>
                </div>
              ) : (
                <MuiButton
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={handleClose}
                  aria-label={i18n.done()}
                  type="button"
                >
                  {i18n.done()}
                </MuiButton>
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
