import Drawer from '@mui/material/Drawer';
import React, {useEffect, useState} from 'react';
import FocusLock from 'react-focus-lock';

import {useTeachingProfileData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';

import {useAppSelector} from '../util/reduxHooks';

import AiDiffArtifactSavePage from './AiDiffArtifactSavePage';
import AiDiffHeader from './AiDiffHeader';
import AiDiffWorkSpace from './AiDiffWorkspace';
import {DRAWER_WIDTH, DRAWER_WIDTH_WELCOME} from './constants';
import {Context} from './types';
import AiDiffWelcome from './welcome/AiDiffWelcome';

import style from './ai-differentiation.module.scss';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  context: Context;
  curriculumCourses: string[];
  scriptName?: string;
  unreadNotificationCount: number;
}

const AI_DIFF_CLOSE_BUTTON_CLASSNAME = 'ai_diff_close_button';

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
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

  const isWelcomeView =
    !hasCompletedAiDifferentiationWelcome && showWelcomeExperience;
  const drawerWidth = isWelcomeView ? DRAWER_WIDTH_WELCOME : DRAWER_WIDTH;

  // Push only #main_content (not the header, which is a sibling) to make room
  // for the drawer. The transition timing matches MUI Drawer defaults.
  useEffect(() => {
    const mainContent = document.getElementById('main_content');
    if (!mainContent) return;
    const enterTransition = 'margin-right 225ms cubic-bezier(0, 0, 0.2, 1) 0ms';
    const leaveTransition =
      'margin-right 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms';
    mainContent.style.transition = chatIsOpen
      ? enterTransition
      : leaveTransition;
    mainContent.style.marginRight = chatIsOpen ? `${drawerWidth}px` : '0px';
    return () => {
      mainContent.style.marginRight = '';
      mainContent.style.transition = '';
    };
  }, [chatIsOpen, drawerWidth]);

  let content;
  if (pendingArtifactMessage) {
    content = <AiDiffArtifactSavePage message={pendingArtifactMessage} />;
  } else if (curriculumCourses) {
    if (isWelcomeView) {
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
      anchor="right"
      open={chatIsOpen}
      variant="persistent"
      PaperProps={{
        sx: {width: drawerWidth, top: 50, height: 'calc(100% - 50px)'},
      }}
    >
      <FocusLock
        disabled={!chatIsOpen}
        lockProps={{
          style: {display: 'flex', flexDirection: 'column', height: '100%'},
        }}
      >
        <AiDiffHeader
          closeTutor={closeTutor}
          closeButtonClassName={AI_DIFF_CLOSE_BUTTON_CLASSNAME}
        />
        <div className={style.fabBackground}>{content}</div>
      </FocusLock>
    </Drawer>
  );
};

export default AiDiffContainer;
