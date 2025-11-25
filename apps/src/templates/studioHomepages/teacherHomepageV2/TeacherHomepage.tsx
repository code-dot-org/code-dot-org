import Alert from '@code-dot-org/component-library/alert';
import {Typography} from '@mui/material';
import React from 'react';

import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {atRiskAgeGatedSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {detectNetworkAvailability} from '@cdo/apps/util/detectNetworkAvailability';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {AgeGatedSectionsBanner} from '../../policy_compliance/AgeGatedSectionsModal/AgeGatedSectionsBanner';
import {
  asyncLoadTeacherHomepageSectionData,
  asyncLoadCoteacherInvite,
} from '../../teacherDashboard/teacherSectionsRedux';
import CoteacherInviteNotification from '../CoteacherInviteNotification';

import {EmptyHomepage} from './EmptyHomepage';
import {Header} from './Header';
import {SectionList} from './SectionList';
import TeacherHomepagePopups from './TeacherHomepagePopups';
import TeacherPromotions from './TeacherPromotions';

import styles from './teacherHomepage.module.scss';

export type ArchivedToggleOption = 'teaching' | 'archived';

const LOGGED_TEACHER_SESSION = 'logged_teacher_session';

interface TeacherHomepageProps {
  studioUrlPrefix: string;
}

const TeacherHomepage: React.FC<TeacherHomepageProps> = ({studioUrlPrefix}) => {
  const teacherName = useAppSelector(state => state.currentUser.displayName);
  const teacherId = useAppSelector(state => state.currentUser.userId);

  const [personaData, setPersonaData] = React.useState<{
    hasMatchedPersona: boolean | null;
    isLoading: boolean;
  }>({
    hasMatchedPersona: null,
    isLoading: true,
  });
  const [
    hasDismissedPersonalizationAlert,
    setHasDismissedPersonalizationAlert,
  ] = React.useState<boolean>(false);
  const [
    isLoadingPersonalizationAlertStatus,
    setIsLoadingPersonalizationAlertStatus,
  ] = React.useState<boolean>(true);

  const dispatch = useAppDispatch();

  const [CAPmodalOpen, setCAPModalOpen] = React.useState(false);
  const toggleCAPModal = () => {
    setCAPModalOpen(!CAPmodalOpen);
  };

  const ageGatedSections = useAppSelector(atRiskAgeGatedSections);

  const shouldDisplayAtRiskAgeGatedWarning = () => {
    return ageGatedSections?.length > 0;
  };

  React.useEffect(() => {
    dispatch(asyncLoadTeacherHomepageSectionData());
    dispatch(asyncLoadCoteacherInvite());

    // Fetch personalization alert dismissal status
    const fetchPersonalizationStatus = async () => {
      try {
        const userPreferences = new UserPreferences();
        const hasDismissed =
          await userPreferences.getHasDismissedPersonalizationAlert();
        setHasDismissedPersonalizationAlert(hasDismissed);
      } catch (error) {
        console.error('Error fetching personalization alert status:', error);
        setHasDismissedPersonalizationAlert(false);
      } finally {
        setIsLoadingPersonalizationAlertStatus(false);
      }
    };

    fetchPersonalizationStatus();

    // Fetch teaching profile data
    const fetchTeachingProfileData = async () => {
      try {
        const response = await fetch('/teaching_profile_data');
        const data = await response.json();
        setPersonaData({
          hasMatchedPersona: !!data.data.matchedPersona,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching teaching profile data:', error);
        setPersonaData({
          hasMatchedPersona: false,
          isLoading: false,
        });
      }
    };

    fetchTeachingProfileData();
  }, [dispatch]);

  const hasNotYetAnsweredPersonalizationQuestions = React.useMemo(() => {
    // Don't show while loading
    if (personaData.isLoading) {
      return false;
    }
    // Show alert only when hasMatchedPersona is explicitly false
    return personaData.hasMatchedPersona === false;
  }, [personaData]);

  const shouldShowPersonalizationAlert = React.useMemo(() => {
    // Don't show if still loading data
    if (personaData.isLoading || isLoadingPersonalizationAlertStatus) {
      return false;
    }

    // Don't show if user has already dismissed the alert
    if (hasDismissedPersonalizationAlert) {
      return false;
    }

    // Don't show if user hasn't answered personalization questions yet
    if (!hasNotYetAnsweredPersonalizationQuestions) {
      return false;
    }

    return true;
  }, [
    personaData.isLoading,
    isLoadingPersonalizationAlertStatus,
    hasDismissedPersonalizationAlert,
    hasNotYetAnsweredPersonalizationQuestions,
  ]);

  React.useEffect(() => {
    // Send one analytics event when a teacher logs in. Use session storage to determine
    // whether they've just logged in.
    if (
      !!teacherId &&
      tryGetSessionStorage(LOGGED_TEACHER_SESSION, 'false') !== 'true'
    ) {
      trySetSessionStorage(LOGGED_TEACHER_SESSION, 'true');

      analyticsReporter.sendEvent(
        EVENTS.TEACHER_LOGIN_EVENT,
        {
          'user id': teacherId,
        },
        PLATFORMS.BOTH
      );
    }
    analyticsReporter.sendEvent(
      EVENTS.NEW_TEACHER_HOMEPAGE_VISITED,
      {},
      PLATFORMS.BOTH
    );

    // Temporarily check network availability on teacher login
    detectNetworkAvailability(teacherId);
  }, [teacherId]);

  const [selectedArchiveToggle, setSelectedArchiveToggle] =
    React.useState<ArchivedToggleOption>('teaching');

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

  const handleAlertClose = () => {
    setHasDismissedPersonalizationAlert(true);
    new UserPreferences().setHasDismissedPersonalizationAlert(true);
  };

  return (
    <div className={styles.teacherHomepage}>
      <div className={styles.teacherHomepageBody}>
        <Typography variant="h2" gutterBottom>
          {teacherName
            ? i18n.welcome({teacherName: teacherName})
            : i18n.welcomeWithoutName()}
        </Typography>
        <div className={styles.teacherHomepageContent}>
          <div className={styles.teacherHomepageLeftContent}>
            {shouldShowPersonalizationAlert && (
              <Alert
                aria-labelledby="feedback-banner-title"
                showIcon={true}
                className={styles.notificationBanner}
                icon={{
                  iconName: 'user-circle',
                }}
                type={'primary'}
                text={i18n.personalizationInvitation()}
                link={{
                  text: i18n.personalizationLinkText(),
                  href: '/users/personalization_information',
                }}
                onClose={handleAlertClose}
              />
            )}
            <Header
              selectedArchiveToggle={selectedArchiveToggle}
              setSelectedArchiveToggle={onArchiveToggleChange}
            />

            {shouldDisplayAtRiskAgeGatedWarning() && (
              <AgeGatedSectionsBanner
                toggleModal={toggleCAPModal}
                modalOpen={CAPmodalOpen}
                ageGatedSections={ageGatedSections}
              />
            )}

            <CoteacherInviteNotification
              isForPl={false}
              destructiveLoad={true}
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
      <TeacherHomepagePopups />
    </div>
  );
};

export default TeacherHomepage;
