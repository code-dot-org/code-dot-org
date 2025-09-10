import React from 'react';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {trySetLocalStorage, tryGetLocalStorage} from '@cdo/apps/utils';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

import {SchoolInfo} from './TeacherHomepageConstants';
import TeacherHomepageDrawer from './TeacherHomepageDrawer';
import WelcomePopup from './welcome/WelcomePopup';

export interface TeacherHomepagePopupsProps {}

interface DrawerData {
  showSchoolInfoInterstitial: boolean;
  showSchoolInfoConfirmation: boolean;
  existingSchoolInfo: SchoolInfo;
  afeEligible: boolean;
}

/**
 * This component handles all popups, drawers, modals and floating action buttons
 * on the teacher homepage.
 * If we need to show the Drawer with school info confirmations, we will always show that.
 * If we don't show the drawer and should show the welcome popup, we will show that.
 * Otherwise, we will allow the AiDiffFloatingActionButton to pulse and start open.
 *
 * If either the drawer or welcome popup is shown, the AiDiffFloatingActionButton will not pulse or start open.
 */
const TeacherHomepagePopups: React.FC<TeacherHomepagePopupsProps> = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [schoolInfoInterstitialOpen, setSchoolInfoInterstitialOpen] =
    React.useState(false);
  const [schoolInfoConfirmationOpen, setSchoolInfoConfirmationOpen] =
    React.useState(false);
  const [existingSchoolInfo, setExistingSchoolInfo] = React.useState<
    SchoolInfo | undefined
  >(undefined);
  const [AFEDrawerOpen, setAFEDrawerOpen] = React.useState(true); //TODO: set to false

  const [hasSeenPopup, setHasSeenPopup] = React.useState(false);

  const hasSeenHomepageWelcome = useAppSelector(
    state => state.currentUser.hasSeenHomepageWelcome
  );

  const aiDifferentiationEnabled = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );

  const hasSeenPopupInLastDay = React.useMemo(() => {
    // Allows triggering of drawer with URL params for testing / debugging
    const searchParams = new URLSearchParams(window.location.search);
    if (
      searchParams.has('showSchoolInfoInterstitial') ||
      searchParams.has('showSchoolInfoConfirmation') ||
      searchParams.has('showAFE')
    ) {
      return null;
    }

    const lastSeen = tryGetLocalStorage('teacher-homepage-popup-last-seen', '');
    if (!lastSeen || lastSeen === '') {
      return null;
    }

    const lastSeenDate = new Date(lastSeen);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastSeenDate >= oneDayAgo;
  }, []);

  const onClosePopup = React.useCallback(() => {
    setHasSeenPopup(true);
    trySetLocalStorage(
      'teacher-homepage-popup-last-seen',
      new Date().toISOString()
    );
  }, []);

  // Load school data and set the drawer state based on the response.
  React.useEffect(() => {
    HttpClient.fetchJson<DrawerData>('/teacher_dashboard/get_drawer_data')
      .then(data => {
        setExistingSchoolInfo(data.value.existingSchoolInfo);
        setSchoolInfoInterstitialOpen(data.value.showSchoolInfoInterstitial);
        setSchoolInfoConfirmationOpen(data.value.showSchoolInfoConfirmation);
        setAFEDrawerOpen(data.value.afeEligible);

        // Allows triggering of drawer with URL params for testing / debugging
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('showSchoolInfoInterstitial') === 'true') {
          setSchoolInfoInterstitialOpen(true);
          // We don't want to set all to true at the same time
        } else if (searchParams.get('showSchoolInfoConfirmation') === 'true') {
          setSchoolInfoConfirmationOpen(true);
        } else if (searchParams.get('showAFE') === 'true') {
          setAFEDrawerOpen(true);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  }, [
    setExistingSchoolInfo,
    setSchoolInfoInterstitialOpen,
    setSchoolInfoConfirmationOpen,
  ]);

  const popup = React.useMemo(() => {
    if (isLoading || hasSeenPopupInLastDay || hasSeenPopup) {
      return null;
    } else if (
      schoolInfoInterstitialOpen ||
      schoolInfoConfirmationOpen ||
      AFEDrawerOpen
    ) {
      return (
        <TeacherHomepageDrawer
          existingSchoolInfo={existingSchoolInfo}
          schoolInfoConfirmationOpenInitially={schoolInfoConfirmationOpen}
          schoolInfoInterstitialOpenInitially={schoolInfoInterstitialOpen}
          afeOpenInitially={AFEDrawerOpen}
          onCloseCallback={onClosePopup}
        />
      );
    } else if (
      DCDO.get('teacher-homepage-welcome', false) &&
      (!hasSeenHomepageWelcome ||
        new URLSearchParams(window.location.search).get(
          'showHomepageWelcome'
        ) === 'true')
    ) {
      return <WelcomePopup onCloseCallback={onClosePopup} />;
    }
    return null;
  }, [
    isLoading,
    hasSeenPopupInLastDay,
    schoolInfoInterstitialOpen,
    schoolInfoConfirmationOpen,
    AFEDrawerOpen,
    existingSchoolInfo,
    onClosePopup,
    hasSeenHomepageWelcome,
    hasSeenPopup,
  ]);

  return (
    <>
      {popup}
      {aiDifferentiationEnabled &&
        experiments.isEnabled('ai-differentiation') && (
          <AiDiffFloatingActionButton
            context={{type: AiDiffContext.GENERAL}}
            canShowPulse={
              !isLoading && !hasSeenPopup && !popup && !hasSeenPopupInLastDay
            }
            canStartOpen={!isLoading && !hasSeenPopup && !popup}
            canDefaultOpen={
              !isLoading && !hasSeenPopup && !popup && !hasSeenPopupInLastDay
            }
          />
        )}
    </>
  );
};

export default TeacherHomepagePopups;
