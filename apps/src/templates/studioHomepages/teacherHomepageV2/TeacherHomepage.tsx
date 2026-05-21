import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import {Typography} from '@mui/material';
import React from 'react';

import {VERIFIED_TEACHER_SUPPORT_LINK} from '@cdo/apps/aichat/constants';
import DCDO from '@cdo/apps/dcdo';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {detectNetworkAvailability} from '@cdo/apps/util/detectNetworkAvailability';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {
  asyncLoadTeacherHomepageSectionData,
  asyncLoadCoteacherInvite,
  fetchDemoPresets,
} from '../../teacherDashboard/teacherSectionsRedux';
import CoteacherInviteNotification from '../CoteacherInviteNotification';

import DemoSectionCard from './DemoSectionCard';
import {EmptyHomepage} from './EmptyHomepage';
import {Header} from './Header';
import LogoTransition from './LogoTransition';
import OnboardingChecklist from './OnboardingChecklist';
import {SectionList} from './SectionList';
import TeacherHomepagePopups from './TeacherHomepagePopups';
import TeacherPromotions from './TeacherPromotions';
import useCreateSectionTour from './useCreateSectionTour';

import styles from './teacherHomepage.module.scss';

export type ArchivedToggleOption = 'teaching' | 'archived';

const LOGGED_TEACHER_SESSION = 'logged_teacher_session';
interface TeacherHomepageProps {
  studioUrlPrefix: string;
  logoTransitionGifUrl?: string;
  logoTransitionMp4Url?: string;
  logoSvgUrl?: string;
}

interface EssentialAiDependencyResponse {
  has_assigned_essential_ai_dependency: boolean;
}

const TeacherHomepage: React.FC<TeacherHomepageProps> = ({
  studioUrlPrefix,
  logoTransitionGifUrl,
  logoTransitionMp4Url,
  logoSvgUrl,
}) => {
  const isMiniTutorialEnabled =
    experiments.isEnabled(experiments.ONBOARDING) ||
    DCDO.get('onboarding-enabled', false);
  // TODO: replace with real data once teacher grade level is stored on the platform
  const isElementaryTeacher = true;
  const tour = useCreateSectionTour(isElementaryTeacher);
  const isDemoSectionEnabled = experiments.isEnabled('demo-section');

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
  const [
    hasAssignedEssentialAiDependency,
    setHasAssignedEssentialAiDependency,
  ] = React.useState<boolean>(false);

  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(asyncLoadTeacherHomepageSectionData());
    if (isDemoSectionEnabled) {
      dispatch(fetchDemoPresets());
    }
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
  }, [dispatch, isDemoSectionEnabled]);

  const aiChatAccessLevel = useAppSelector(
    state => state.currentUser.aiChatAccessLevel
  );

  React.useEffect(() => {
    if (aiChatAccessLevel !== AiChatAccessLevels.DISABLED) {
      return;
    }

    const fetchEssentialAiDependency = async () => {
      try {
        const {value} =
          await HttpClient.fetchJson<EssentialAiDependencyResponse>(
            '/api/v1/sections/assigned_essential_ai_dependency'
          );
        setHasAssignedEssentialAiDependency(
          value.has_assigned_essential_ai_dependency
        );
      } catch (error) {
        console.error('Error fetching essential AI dependency:', error);
      }
    };

    fetchEssentialAiDependency();
  }, [aiChatAccessLevel]);

  const shouldShowVerificationAlert =
    aiChatAccessLevel === AiChatAccessLevels.DISABLED &&
    hasAssignedEssentialAiDependency;

  const needsToAnswerPersonalizationQuestions = React.useMemo(() => {
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

    // Don't show if user has answered personalization questions
    if (!needsToAnswerPersonalizationQuestions) {
      return false;
    }

    return true;
  }, [
    personaData.isLoading,
    isLoadingPersonalizationAlertStatus,
    hasDismissedPersonalizationAlert,
    needsToAnswerPersonalizationQuestions,
  ]);

  React.useEffect(() => {
    // Send one analytics event when a teacher logs in. Use session storage to determine
    // whether they've just logged in.
    if (
      !!teacherId &&
      tryGetSessionStorage(LOGGED_TEACHER_SESSION, 'false') !== 'true'
    ) {
      trySetSessionStorage(LOGGED_TEACHER_SESSION, 'true');

      analyticsReporter.sendEvent(EVENTS.TEACHER_LOGIN_EVENT, {
        'user id': teacherId,
      });
    }
    analyticsReporter.sendEvent(EVENTS.NEW_TEACHER_HOMEPAGE_VISITED, {});

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
    analyticsReporter.sendEvent(toggleEvent, {});
    setSelectedArchiveToggle(value);
  };

  const handleAlertClose = () => {
    setHasDismissedPersonalizationAlert(true);
    new UserPreferences().setHasDismissedPersonalizationAlert(true);
  };

  return (
    <div className={styles.teacherHomepage}>
      {logoTransitionGifUrl && logoSvgUrl && (
        <LogoTransition
          gifSrc={logoTransitionGifUrl}
          mp4Src={logoTransitionMp4Url}
          svgSrc={logoSvgUrl}
        />
      )}
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
            {shouldShowVerificationAlert && (
              <Alert
                type={alertTypes.warning}
                text="Your students won't be able to complete some of their assigned curriculum until you verify your teacher account."
                link={{
                  text: 'Learn how to get verified',
                  href: VERIFIED_TEACHER_SUPPORT_LINK,
                }}
              />
            )}
            <Header
              selectedArchiveToggle={selectedArchiveToggle}
              setSelectedArchiveToggle={onArchiveToggleChange}
            />

            <CoteacherInviteNotification
              isForPl={false}
              destructiveLoad={true}
            />
            {!!isMiniTutorialEnabled && (
              <OnboardingChecklist createSectionTour={tour} />
            )}
            {!isDemoSectionEnabled ? (
              numSections === 0 ? (
                <EmptyHomepage showHiddenOnly={showHiddenOnly} />
              ) : (
                <SectionList
                  showHiddenOnly={showHiddenOnly}
                  studioUrlPrefix={studioUrlPrefix}
                />
              )
            ) : numSections === 0 ? (
              <DemoSectionCard showHiddenOnly={showHiddenOnly} />
            ) : (
              <SectionList
                showHiddenOnly={showHiddenOnly}
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
