import Drawer from '@mui/material/Drawer';
import React, {useCallback, useEffect, useState} from 'react';

import {useTeachingProfileData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import {fetchThreadMessages} from '@cdo/apps/aiDifferentiation/redux';
import experiments from '@cdo/apps/util/experiments';

import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

import AiDiffArtifactSavePage from './AiDiffArtifactSavePage';
import AiDiffHeader from './AiDiffHeader';
import AiDiffWorkSpace from './AiDiffWorkspace';
import BottomNav from './BottomNav';
import {DRAWER_WIDTH, DRAWER_WIDTH_WELCOME} from './constants';
import HomeScreen from './HomeScreen';
import NotificationList from './notifications/NotificationList';
import PrepareList from './PrepareList';
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
  const [activeNav, setActiveNav] = useState('Chats');
  const showLearn = experiments.isEnabled('sidebar-prepare');
  const [showChatList, setShowChatList] = useState(false);
  const {personalizationData} = useTeachingProfileData();
  const dispatch = useAppDispatch();

  const hasCompletedAiDifferentiationWelcome = useAppSelector(
    state => state.currentUser.hasCompletedAiDifferentiationWelcome
  );

  const pendingArtifactMessage = useAppSelector(
    state => state.aiDiffChat.pendingArtifactMessage
  );

  const chatIsOpen = useAppSelector(state => state.aiDiffChat.chatIsOpen);

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
  }, [chatIsOpen, drawerWidth]);

  const onAlertPromptClick = useCallback(
    (label: string, prompt: string) => {
      dispatch(
        fetchThreadMessages({
          contextType: context.type,
          thread: 0,
          initialThreadPrompt: {label, prompt},
          curriculumCourses,
        })
      );
      setActiveNav('Chats');
      setShowChatList(false);
    },
    [dispatch, context, curriculumCourses]
  );

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
    } else if (activeNav === 'Home') {
      content = (
        <HomeScreen
          context={context}
          curriculumCourses={curriculumCourses}
          onStartChat={() => {
            setActiveNav('Chats');
            setShowChatList(false);
          }}
        />
      );
    } else if (activeNav === 'Alerts') {
      content = <NotificationList aiPromptClick={onAlertPromptClick} />;
    } else if (activeNav === 'Prepare') {
      content = <PrepareList />;
    } else {
      content = (
        <AiDiffWorkSpace
          context={context}
          personalizationData={personalizationData}
          scriptName={scriptName}
          curriculumCourses={curriculumCourses}
          showSidebar={showChatList}
          onSidebarChatSelect={() => setShowChatList(false)}
          onViewThreads={() => setShowChatList(true)}
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
      <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
        <AiDiffHeader
          closeTutor={closeTutor}
          closeButtonClassName={AI_DIFF_CLOSE_BUTTON_CLASSNAME}
        />
        <div className={style.fabBackgroundDrawer}>{content}</div>
        <BottomNav
          activeLabel={activeNav}
          onNavChange={label => {
            setActiveNav(label);
            setShowChatList(label === 'Chats');
          }}
          unreadNotificationCount={unreadNotificationCount}
          showLearn={showLearn}
        />
      </div>
    </Drawer>
  );
};

export default AiDiffContainer;
