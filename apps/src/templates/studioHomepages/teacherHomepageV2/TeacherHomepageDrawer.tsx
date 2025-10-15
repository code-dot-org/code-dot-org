import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {
  BodyThreeText,
  Heading3,
} from '@code-dot-org/component-library/typography';
import Drawer from '@mui/material/Drawer';
import React from 'react';

import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import SchoolDataInputs from '../../SchoolDataInputs';

import drawerConfirmationImage from './images/drawer-confirmation-image.png';
import NpsSurveyContainer from './NpsSurveyContainer';
import {SchoolInfo} from './TeacherHomepageConstants';

import styles from './teacherHomepage.module.scss';

const NON_SCHOOL_OPTIONS = ['selectASchool', 'clickToAdd', 'noSchoolSetting'];

interface TeacherHomepageDrawerProps {
  existingSchoolInfo?: SchoolInfo;
  schoolInfoInterstitialOpenInitially: boolean;
  schoolInfoConfirmationOpenInitially: boolean;
  afeOpenInitially: boolean;
  npsOpenInitially: boolean;
  npsProps: string;
  onCloseCallback: () => void;
}

export const TeacherHomepageDrawer: React.FC<TeacherHomepageDrawerProps> = ({
  existingSchoolInfo,
  schoolInfoInterstitialOpenInitially,
  schoolInfoConfirmationOpenInitially,
  afeOpenInitially,
  npsOpenInitially,
  npsProps,
  onCloseCallback,
}) => {
  const [schoolInfoInterstitialOpen, setSchoolInfoInterstitialOpen] =
    React.useState(schoolInfoInterstitialOpenInitially);
  const [schoolInfoConfirmationOpen, setSchoolInfoConfirmationOpen] =
    React.useState(schoolInfoConfirmationOpenInitially);
  const [showSchoolInfoUnknownError, setShowSchoolInfoUnknownError] =
    React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [AFEDrawerOpen, setAFEDrawerOpen] = React.useState(afeOpenInitially);
  const [AFEParticipate, setAFEParticipate] = React.useState(false);
  const [NPSOpen, setNPSOpen] = React.useState(npsOpenInitially);
  const [NPSSuccess, setNPSSuccess] = React.useState(false);

  const isOpen = React.useMemo<boolean>(
    () =>
      schoolInfoInterstitialOpen ||
      schoolInfoConfirmationOpen ||
      success ||
      AFEDrawerOpen ||
      NPSOpen ||
      NPSSuccess,
    [
      schoolInfoInterstitialOpen,
      schoolInfoConfirmationOpen,
      success,
      AFEDrawerOpen,
      NPSOpen,
      NPSSuccess,
    ]
  );

  const inUSA = useAppSelector(state => state.currentUser.inUSA);
  const schoolInfo = useSchoolInfo({
    usIp: inUSA,
    country: existingSchoolInfo?.country,
    schoolName: existingSchoolInfo?.school_name,
    schoolId: existingSchoolInfo?.school_id,
    schoolZip: existingSchoolInfo?.school_zip,
    schoolType: existingSchoolInfo?.school_type,
  });

  const existingSchoolName =
    existingSchoolInfo?.school_name || i18n.schoolInfoDialogDescriptionNoName();

  const NpsSurveyComplete = () => {
    setNPSOpen(false);
    setNPSSuccess(true);
  };

  const headerText: () => string = () => {
    if (schoolInfoInterstitialOpen) {
      return i18n.censusHeading();
    } else if (schoolInfoConfirmationOpen) {
      return i18n.reviewSchoolInfo();
    } else if (success) {
      return i18n.thankYouForUpdatingYourSchool();
    } else if (AFEDrawerOpen) {
      return i18n.afeDrawerHeader();
    } else if (NPSOpen) {
      return i18n.helpUsImprove();
    } else if (NPSSuccess) {
      return i18n.NPSSuccessHeader();
    }
  };

  const bodyText: () => string = () => {
    if (schoolInfoInterstitialOpen) {
      return i18n.schoolInfoInterstitialTitle();
    } else if (schoolInfoConfirmationOpen) {
      return `${i18n.schoolInfoDialogDescription()}${i18n.schoolInfoDialogDescriptionSchoolName(
        {schoolName: existingSchoolName}
      )}`;
    } else if (success) {
      return i18n.schoolInfoDrawerSuccess();
    } else if (AFEDrawerOpen) {
      return i18n.afeBannerParagraph();
    } else if (NPSSuccess) {
      return i18n.NPSSuccessBody();
    }
  };

  const interactiveContent: () => React.ReactNode = () => {
    if (schoolInfoInterstitialOpen) {
      return (
        <div className={styles.drawerContent}>
          {showSchoolInfoUnknownError && (
            <Alert
              type={'danger'}
              size={'s'}
              text={i18n.schoolInfoInterstitialUnknownError()}
            />
          )}
          <SchoolDataInputs {...schoolInfo} includeHeaders={false} />
        </div>
      );
    } else if (NPSOpen) {
      return (
        <div className={styles.drawerContent}>
          {!!npsProps && (
            <NpsSurveyContainer
              NPSProps={npsProps}
              onCompleteCallback={NpsSurveyComplete}
            />
          )}
        </div>
      );
    } else {
      return null;
    }
  };

  const primaryButton: () => React.ReactNode = () => {
    if (schoolInfoInterstitialOpen) {
      return (
        <Button
          type={'primary'}
          size={'m'}
          text={i18n.save()}
          onClick={handlePrimaryButtonClick}
        />
      );
    } else if (schoolInfoConfirmationOpen) {
      return (
        <Button
          type={'primary'}
          size={'m'}
          text={i18n.imAtaNewSchool()}
          onClick={handlePrimaryButtonClick}
        />
      );
    } else if (success) {
      return (
        <Button
          type={'primary'}
          size={'m'}
          text={i18n.closeDialog()}
          onClick={handlePrimaryButtonClick}
        />
      );
    } else if (AFEDrawerOpen) {
      return (
        <Button
          type={'primary'}
          size={'m'}
          iconRight={{iconName: 'up-right-from-square'}}
          text={i18n.learnMore()}
          onClick={handlePrimaryButtonClick}
        />
      );
    }
  };

  const secondaryButton: () => React.ReactNode = () => {
    if (schoolInfoConfirmationOpen) {
      return (
        <Button
          type={'secondary'}
          size={'m'}
          color={'gray'}
          text={i18n.imStillTeachingHere()}
          onClick={onDrawerClose}
        />
      );
    } else if (success) {
      return null;
    } else if (AFEDrawerOpen) {
      return (
        <Button
          type={'secondary'}
          size={'m'}
          color={'gray'}
          text={i18n.notInterested()}
          onClick={onDrawerClose}
        />
      );
    } else {
      return (
        <Button
          type={'secondary'}
          size={'m'}
          color={'gray'}
          text={i18n.dismiss()}
          onClick={onDrawerClose}
        />
      );
    }
  };

  const tryUpdateSchoolInfo = async () => {
    const hasNcesId =
      schoolInfo.schoolId && !NON_SCHOOL_OPTIONS.includes(schoolInfo.schoolId);
    analyticsReporter.sendEvent(
      EVENTS.SCHOOL_INTERSTITIAL_SUBMIT,
      {
        hasNcesId: hasNcesId.toString(),
        attempt: showSchoolInfoUnknownError ? 2 : 1,
      },
      PLATFORMS.BOTH
    );
    try {
      await updateSchoolInfo({
        schoolId: schoolInfo.schoolId,
        country: schoolInfo.country,
        schoolName: schoolInfo.schoolName,
        schoolZip: schoolInfo.schoolZip,
      });

      analyticsReporter.sendEvent(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_SUCCESS,
        {
          attempt: showSchoolInfoUnknownError ? 2 : 1,
        },
        PLATFORMS.BOTH
      );

      setSuccess(true);
      setSchoolInfoInterstitialOpen(false);
    } catch (error) {
      analyticsReporter.sendEvent(
        EVENTS.SCHOOL_INTERSTITIAL_SAVE_FAILURE,
        {
          attempt: showSchoolInfoUnknownError ? 2 : 1,
        },
        PLATFORMS.BOTH
      );

      if (!showSchoolInfoUnknownError) {
        // First failure, display error message and give the teacher a chance
        // to try again.
        setShowSchoolInfoUnknownError(true);
      } else {
        // We already failed once, let's not block the teacher any longer.
        onDrawerClose();
      }
    }
  };

  const handlePrimaryButtonClick = async () => {
    if (success) {
      // If the drawer is already showing success, we just want to close it.
      onDrawerClose();
    } else if (schoolInfoConfirmationOpen) {
      // If the confirmation drawer is open, the user can click through to
      // make the school info panel appear.
      analyticsReporter.sendEvent(
        EVENTS.CONFIRM_SCHOOL_CLICKED,
        {},
        PLATFORMS.BOTH
      );
      setSchoolInfoInterstitialOpen(true);
      setSchoolInfoConfirmationOpen(false);
    } else if (schoolInfoInterstitialOpen) {
      // If the interstitial is open, we want to submit the school info.
      tryUpdateSchoolInfo();
    } else if (AFEDrawerOpen) {
      analyticsReporter.sendEvent(
        EVENTS.AFE_HOMEPAGE_BANNER_SUBMIT,
        {},
        PLATFORMS.BOTH
      );

      setAFEParticipate(true);
      onDrawerClose();
    }
  };

  const onDrawerClose = () => {
    if (schoolInfoInterstitialOpen) {
      analyticsReporter.sendEvent(
        EVENTS.SCHOOL_INTERSTITIAL_DISMISS,
        {},
        PLATFORMS.BOTH
      );
    } else if (schoolInfoConfirmationOpen) {
      analyticsReporter.sendEvent(
        EVENTS.UPDATE_SCHOOL_INFO_DIALOG_CLOSED,
        {},
        PLATFORMS.BOTH
      );
    } else if (AFEDrawerOpen) {
      analyticsReporter.sendEvent(
        EVENTS.AFE_HOMEPAGE_BANNER_SUBMIT,
        {},
        PLATFORMS.BOTH
      );

      HttpClient.post(
        '/dashboardapi/v1/users/me/dismiss_donor_teacher_banner',
        JSON.stringify({
          participate: AFEParticipate,
          source: 'teacher_home',
        }),
        true,
        {
          'Content-Type': 'application/json',
        }
      ).catch(error => console.error(error));

      // redirect to form on amazon-future-engineer page if user accepted
      if (AFEParticipate) {
        window.location.assign(pegasus('/amazon-future-engineer#eligibility'));
      }
    }
    setSchoolInfoInterstitialOpen(false);
    setSchoolInfoConfirmationOpen(false);
    setSuccess(false);
    setAFEDrawerOpen(false);
    setNPSOpen(false);
    setNPSSuccess(false);
    onCloseCallback();
  };

  return (
    <Drawer
      className={styles.drawer}
      anchor={'bottom'}
      open={isOpen}
      variant={'persistent'}
    >
      <div id={'ui-test-drawer-toolbar'} className={styles.toolbar}>
        <CloseButton
          aria-label={'close button'}
          onClick={onDrawerClose}
          color={'light'}
          size="l"
          className={''}
        />
      </div>
      <div className={styles.drawerText}>
        {(success || NPSSuccess) && (
          <img
            className={styles.drawerImage}
            src={drawerConfirmationImage}
            alt={
              'green circle with a checkmark inside and streamers floating around it'
            }
          />
        )}
        <Heading3>{headerText()}</Heading3>
        <BodyThreeText>{bodyText()}</BodyThreeText>
      </div>
      {interactiveContent()}
      <div className={styles.drawerFooter}>
        {secondaryButton()}
        {primaryButton()}
      </div>
    </Drawer>
  );
};

export default TeacherHomepageDrawer;
