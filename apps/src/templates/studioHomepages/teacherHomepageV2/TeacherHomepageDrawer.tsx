import Alert from '@code-dot-org/component-library/alert';
import Button from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {
  BodyTwoText,
  Heading2,
} from '@code-dot-org/component-library/typography';
import Drawer from '@mui/material/Drawer';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import SchoolDataInputs from '../../SchoolDataInputs';

import drawerConfirmationImage from './images/drawer-confirmation-image.png';
import {SchoolInfo} from './TeacherHomepageConstants';

import styles from './teacherHomepage.module.scss';

const NON_SCHOOL_OPTIONS = ['selectASchool', 'clickToAdd', 'noSchoolSetting'];

interface TeacherHomepageDrawerProps {
  existingSchoolInfo?: SchoolInfo;
  schoolInfoInterstitialOpenInitially: boolean;
  schoolInfoConfirmationOpenInitially: boolean;
  onCloseCallback: () => void;
}

export const TeacherHomepageDrawer: React.FC<TeacherHomepageDrawerProps> = ({
  existingSchoolInfo,
  schoolInfoInterstitialOpenInitially,
  schoolInfoConfirmationOpenInitially,
  onCloseCallback,
}) => {
  const [schoolInfoInterstitialOpen, setSchoolInfoInterstitialOpen] =
    React.useState(schoolInfoInterstitialOpenInitially);
  const [schoolInfoConfirmationOpen, setSchoolInfoConfirmationOpen] =
    React.useState(schoolInfoConfirmationOpenInitially);
  const [success, setSuccess] = React.useState(false);
  const [showSchoolInfoUnknownError, setShowSchoolInfoUnknownError] =
    React.useState(false);

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
    }
    setSchoolInfoInterstitialOpen(false);
    setSchoolInfoConfirmationOpen(false);
    setSuccess(false);
    onCloseCallback();
  };

  return (
    <Drawer
      className={styles.drawer}
      anchor={'bottom'}
      open={schoolInfoInterstitialOpen || schoolInfoConfirmationOpen || success}
      variant={'persistent'}
    >
      <div className={styles.toolbar}>
        <CloseButton
          aria-label={''}
          onClick={onDrawerClose}
          color={'light'}
          size="l"
          className={''}
        />
      </div>
      <div className={styles.drawerText}>
        {success && (
          <img
            className={styles.drawerImage}
            src={drawerConfirmationImage}
            alt=""
          />
        )}
        <Heading2>
          {schoolInfoConfirmationOpen
            ? i18n.reviewSchoolInfo()
            : success
            ? i18n.thankYouForUpdatingYourSchool()
            : i18n.censusHeading()}
        </Heading2>
        <BodyTwoText>
          {schoolInfoConfirmationOpen
            ? `${i18n.schoolInfoDialogDescription()}${i18n.schoolInfoDialogDescriptionSchoolName(
                {schoolName: existingSchoolName}
              )}`
            : success
            ? i18n.schoolInfoDrawerSuccess()
            : i18n.schoolInfoInterstitialTitle()}
        </BodyTwoText>
      </div>
      {schoolInfoInterstitialOpen && (
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
      )}
      <div className={styles.drawerFooter}>
        {!success && (
          <Button
            type={'secondary'}
            size={'m'}
            color={'gray'}
            text={
              schoolInfoConfirmationOpen
                ? i18n.imStillTeachingHere()
                : i18n.dismiss()
            }
            onClick={onDrawerClose}
          />
        )}
        <Button
          type={'primary'}
          size={'m'}
          text={
            schoolInfoConfirmationOpen
              ? i18n.imAtaNewSchool()
              : success
              ? i18n.closeDialog()
              : i18n.save()
          }
          onClick={handlePrimaryButtonClick}
        />
      </div>
    </Drawer>
  );
};

export default TeacherHomepageDrawer;
