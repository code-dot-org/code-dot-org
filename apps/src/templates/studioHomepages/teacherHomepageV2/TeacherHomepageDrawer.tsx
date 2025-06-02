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

import styles from './teacherHomepage.module.scss';

const NON_SCHOOL_OPTIONS = ['selectASchool', 'clickToAd', 'noSchoolSetting'];

interface SchoolInfo {
  country: string;
  school_name: string;
  school_zip: string;
  school_id: string;
  school_type: string;
}

interface TeacherHomepageDrawerProps {
  showSchoolInfoInterstitial: boolean;
  showSchoolInfoConfirmation: boolean;
  existingSchoolInfo?: SchoolInfo;
}

export const TeacherHomepageDrawer: React.FC<TeacherHomepageDrawerProps> = ({
  showSchoolInfoInterstitial,
  showSchoolInfoConfirmation,
  existingSchoolInfo,
}) => {
  const usIp = useAppSelector(state => state.currentUser.inUSA);
  const schoolInfo = useSchoolInfo({
    usIp,
    country: existingSchoolInfo?.country,
    schoolName: existingSchoolInfo?.school_name,
    schoolId: existingSchoolInfo?.school_id,
    schoolZip: existingSchoolInfo?.school_zip,
    schoolType: existingSchoolInfo?.school_type,
  });

  const [schoolInfoInterstitialOpen, setSchoolInfoInterstitialOpen] =
    React.useState(showSchoolInfoInterstitial);
  const [schoolInfoConfirmationOpen, setSchoolInfoConfirmationOpen] =
    React.useState(showSchoolInfoConfirmation);

  const [showSchoolInfoUnknownError, setShowSchoolInfoUnknownError] =
    React.useState(false);

  const handleSubmit = async () => {
    if (schoolInfoConfirmationOpen) {
      // If the confirmation drawer is open, the user can click through to the
      // make the school info panel appear.
      setSchoolInfoInterstitialOpen(true);
      setSchoolInfoConfirmationOpen(false);
    } else if (schoolInfoInterstitialOpen) {
      // If the interstitial is open, we want to submit the school info.
      const hasNcesId =
        schoolInfo.schoolId &&
        !NON_SCHOOL_OPTIONS.includes(schoolInfo.schoolId);
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

        onDrawerClose();
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
    }
  };

  const onDrawerClose = () => {
    // TODO: Analytics here
  };

  return (
    <Drawer
      className={styles.drawer}
      anchor={'bottom'}
      open={showSchoolInfoInterstitial || showSchoolInfoConfirmation}
      onClose={onDrawerClose}
      variant={'persistent'}
    >
      <div className={styles.toolbar}>
        <CloseButton
          aria-label={''}
          onClick={() => setSchoolInfoInterstitialOpen(false)}
          color={'light'}
          size="l"
          className={''}
        />
      </div>
      <Heading2>
        {schoolInfoConfirmationOpen
          ? i18n.reviewSchoolInfo()
          : i18n.censusHeading()}
      </Heading2>
      <BodyTwoText>
        {schoolInfoConfirmationOpen
          ? `${i18n.schoolInfoDialogDescription()}${i18n.schoolInfoDialogDescriptionSchoolName(
              schoolInfo.schoolName
            )}`
          : i18n.schoolInfoInterstitialTitle()}
      </BodyTwoText>
      <div className={styles.drawerContent}>
        {schoolInfoInterstitialOpen && (
          <SchoolDataInputs {...schoolInfo} includeHeaders={false} />
        )}
      </div>
      <div className={styles.drawerFooter}>
        <Button
          type={'secondary'}
          size={'m'}
          color={'gray'}
          text={i18n.cancel()}
          onClick={() => setSchoolInfoInterstitialOpen(false)}
        />
        <Button
          type={'primary'}
          size={'m'}
          text={i18n.save()}
          onClick={handleSubmit}
        />
      </div>
    </Drawer>
  );
};

export default TeacherHomepageDrawer;
