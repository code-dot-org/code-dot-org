import Alert from '@code-dot-org/component-library/alert';
import {Heading2} from '@code-dot-org/component-library/typography';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useSchoolInfo} from '@cdo/apps/schoolInfo/hooks/useSchoolInfo';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import SchoolDataInputs from '../../SchoolDataInputs';
import {
  asyncLoadTeacherHomepageSectionData,
  asyncLoadCoteacherInvite,
} from '../../teacherDashboard/teacherSectionsRedux';

import {EmptyHomepage} from './EmptyHomepage';
import {Header} from './Header';
import {SectionList} from './SectionList';
import TeacherHomepageDrawer from './TeacherHomepageDrawer';
import TeacherPromotions from './TeacherPromotions';

import styles from './teacherHomepage.module.scss';

export type ArchivedToggleOption = 'teaching' | 'archived';

const NON_SCHOOL_OPTIONS = ['selectASchool', 'clickToAd', 'noSchoolSetting'];

interface TeacherHomepageProps {
  studioUrlPrefix: string;
}

const LOCAL_STORAGE_KEY = 'teacher_homepage_feedback_closed';

export const TeacherHomepage: React.FC<TeacherHomepageProps> = ({
  studioUrlPrefix,
}) => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);
  const existingSchoolInfo = useAppSelector(
    state => state.currentUser.userSchoolInfo
  );
  const usIp = useAppSelector(state => state.currentUser.inUSA);
  const schoolInfo = useSchoolInfo({
    usIp,
    country: existingSchoolInfo?.country,
    schoolName: existingSchoolInfo?.schoolName,
    schoolId: existingSchoolInfo?.schoolId,
    schoolZip: existingSchoolInfo?.schoolZip,
    schoolType: existingSchoolInfo?.schoolType,
  });

  const dispatch = useAppDispatch();

  const [isFeedbackAlertClosed, setIsFeedbackAlertClosed] = React.useState(
    () => tryGetLocalStorage(LOCAL_STORAGE_KEY, '') === 'true'
  );

  const showSchoolInfoInterstitial = useAppSelector(
    state => state.currentUser.showSchoolInfoInterstitial
  );
  const showSchoolInfoConfirmation = useAppSelector(
    state => state.currentUser.showSchoolInfoConfirmation
  );
  const [schoolInfoInterstitialOpen, setSchoolInfoInterstitialOpen] =
    React.useState(showSchoolInfoInterstitial);
  const [schoolInfoConfirmationOpen, setSchoolInfoConfirmationOpen] =
    React.useState(showSchoolInfoConfirmation);

  React.useEffect(() => {
    dispatch(asyncLoadTeacherHomepageSectionData());
    dispatch(asyncLoadCoteacherInvite());
  }, [dispatch]);

  React.useEffect(() => {
    analyticsReporter.sendEvent(
      EVENTS.NEW_TEACHER_HOMEPAGE_VISITED,
      {},
      PLATFORMS.BOTH
    );
  }, []);

  const [selectedArchiveToggle, setSelectedArchiveToggle] =
    React.useState<ArchivedToggleOption>('teaching');

  const [showSchoolInfoUnknownError, setShowSchoolInfoUnknownError] =
    React.useState(false);

  const sections = useAppSelector(state => state.teacherSections.sections);

  // The server uses hidden to mean the same thing as archived.
  const showHiddenOnly = selectedArchiveToggle === 'archived';

  const numSections = React.useMemo(
    () =>
      Object.values(sections).filter(
        section => showHiddenOnly === section.hidden
      ).length,
    [sections, showHiddenOnly]
  );

  const onArchiveToggleChange = (value: ArchivedToggleOption) => {
    const toggleEvent =
      value === 'teaching'
        ? EVENTS.SECTION_LIST_TEACHING_TOGGLE_CLICKED
        : EVENTS.SECTION_LIST_ARCHIVE_TOGGLE_CLICKED;
    analyticsReporter.sendEvent(toggleEvent, {}, PLATFORMS.BOTH);
    setSelectedArchiveToggle(value);
  };

  const handlePrimaryButtonClick = async () => {
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
    setSchoolInfoInterstitialOpen(false);
  };

  return (
    <div className={styles.teacherHomepage}>
      <div className={styles.teacherHomepageBody}>
        <Heading2>
          {teacherName
            ? i18n.welcome({teacherName: teacherName})
            : i18n.welcomeWithoutName()}
        </Heading2>
        {!isFeedbackAlertClosed && (
          <Alert
            className={styles.feedbackAlert}
            size={'s'}
            text={i18n.teacherHomePageFeedback()}
            type="primary"
            showIcon={true}
            icon={{iconName: 'hand-wave'}}
            isImmediateImportance={false}
            link={{
              text: i18n.feedbackHeader(),
              href: 'https://usabi.li/do/a9ksz7qfbspy/iwhhup',
              openInNewTab: true,
              external: true,
            }}
            onClose={() => {
              setIsFeedbackAlertClosed(true);
              trySetLocalStorage(LOCAL_STORAGE_KEY, 'true');
            }}
          />
        )}
        <div className={styles.teacherHomepageContent}>
          <div className={styles.teacherHomepageLeftContent}>
            <Header
              selectedArchiveToggle={selectedArchiveToggle}
              setSelectedArchiveToggle={onArchiveToggleChange}
            />

            {numSections === 0 ? (
              <EmptyHomepage showHiddenOnly={showHiddenOnly} />
            ) : (
              <SectionList
                showHiddenOnly={selectedArchiveToggle === 'archived'}
                studioUrlPrefix={studioUrlPrefix}
              />
            )}
          </div>
          <TeacherPromotions />
        </div>
      </div>
      <TeacherHomepageDrawer
        open={schoolInfoInterstitialOpen || schoolInfoConfirmationOpen}
        onClose={onDrawerClose}
        onPrimaryButtonClick={handlePrimaryButtonClick}
        primaryButtonText={i18n.save()}
        secondaryButtonText={i18n.cancel()}
        interactiveContent={
          schoolInfoInterstitialOpen && (
            <SchoolDataInputs {...schoolInfo} includeHeaders={false} />
          )
        }
        headingText={
          schoolInfoConfirmationOpen
            ? i18n.reviewSchoolInfo()
            : i18n.censusHeading()
        }
        description={
          schoolInfoConfirmationOpen
            ? `${i18n.schoolInfoDialogDescription()}${i18n.schoolInfoDialogDescriptionSchoolName(
                schoolInfo.schoolName
              )}`
            : i18n.schoolInfoInterstitialTitle()
        }
      />
    </div>
  );
};
