import Drawer from '@mui/material/Drawer';
import React, {useEffect, useState} from 'react';
// import FocusLock from 'react-focus-lock';

import {useTeachingProfileData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';

import {useAppSelector} from '../util/reduxHooks';
// import {tryGetSessionStorage, trySetSessionStorage} from '../utils';

import AiDiffArtifactSavePage from './AiDiffArtifactSavePage';
// import AiDiffHeader from './AiDiffHeader';
import AiDiffWorkSpace from './AiDiffWorkspace';
import {Context} from './types';
import AiDiffWelcome from './welcome/AiDiffWelcome';

import style from './ai-differentiation.module.scss';

// const AI_DIFF_POSITION_X = 'aiDiffPositionX';
// const AI_DIFF_POSITION_Y = 'aiDiffPositionY';
interface AiDiffDrawerProps {
  closeTutor?: () => void;
  context: Context;
  curriculumCourses: string[];
  scriptName?: string;
  unreadNotificationCount: number;
}

const DRAWER_WIDTH = 300;

const AiDiffDrawer: React.FC<AiDiffDrawerProps> = ({
  closeTutor,
  context,
  curriculumCourses,
  scriptName,
  unreadNotificationCount,
}) => {
  // Welcome experience shut off in preparation for spring 2026 redesign.
  const [showWelcomeExperience, setShowWelcomeExperience] = useState(false);
  const {personalizationData} = useTeachingProfileData();

  const hasCompletedAiDifferentiationWelcome = useAppSelector(
    state => state.currentUser.hasCompletedAiDifferentiationWelcome
  );

  const pendingArtifactMessage = useAppSelector(
    state => state.aichat.pendingArtifactMessage
  );

  const chatIsOpen = useAppSelector(state => state.aichat.chatIsOpen);

  useEffect(() => {
    const mainContent = document.getElementById('main_content');
    if (mainContent) {
      if (chatIsOpen) {
        mainContent.classList.add('ai-diff-drawer-open');
      } else {
        mainContent.classList.remove('ai-diff-drawer-open');
      }
    }
    return () => {
      document
        .getElementById('main_content')
        ?.classList.remove('ai-diff-drawer-open');
    };
  }, [chatIsOpen]);

  let content;
  if (pendingArtifactMessage) {
    content = <AiDiffArtifactSavePage message={pendingArtifactMessage} />;
  } else if (curriculumCourses) {
    if (!hasCompletedAiDifferentiationWelcome && showWelcomeExperience) {
      content = (
        <AiDiffWelcome
          setShowWelcomeExperience={setShowWelcomeExperience}
          context={context}
          scriptName={scriptName}
          curriculumCourses={curriculumCourses}
        />
      );
    } else {
      content = (
        <AiDiffWorkSpace
          context={context}
          personalizationData={personalizationData}
          scriptName={scriptName}
          curriculumCourses={curriculumCourses}
          unreadNotificationCount={unreadNotificationCount}
        />
      );
    }
  }

  return (
    <Drawer
      variant="persistent"
      open={chatIsOpen}
      anchor="right"
      sx={{
        width: DRAWER_WIDTH,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <div className={style.fabBackground}>{content}</div>
    </Drawer>
  );
};

export default AiDiffDrawer;
