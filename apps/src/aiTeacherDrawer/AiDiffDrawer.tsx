import Drawer from '@mui/material/Drawer';
import classNames from 'classnames';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useTeachingProfileData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import {
  clearRequestedNav,
  fetchThreadMessages,
} from '@cdo/apps/aiTeacherDrawer/redux';
import experiments from '@cdo/apps/util/experiments';
import {setTaDrawerInset} from '@cdo/apps/util/taDrawerInset';

import {useAppDispatch, useAppSelector} from '../util/reduxHooks';

import AiDiffArtifactSavePage from './AiDiffArtifactSavePage';
import AiDiffHeader from './AiDiffHeader';
import AiDiffWorkSpace from './AiDiffWorkspace';
import BottomNav from './BottomNav';
import {DRAWER_WIDTH, DRAWER_WIDTH_WELCOME} from './constants';
import HomeScreen from './HomeScreen';
import NotificationList from './notifications/NotificationList';
import PrepareList from './PrepareList';
import RubricsScreen from './RubricsScreen';
import TeacherPanelScreen from './TeacherPanelScreen';
import {Context} from './types';
import AiDiffWelcome from './welcome/AiDiffWelcome';

import style from './ai-differentiation.module.scss';

interface AiDiffContainerProps {
  closeTutor?: () => void;
  context: Context;
  curriculumCourses: string[];
  scriptName?: string;
  unreadNotificationCount: number;
  /**
   * Render as a sized box in the surrounding flow instead of a drawer fixed to
   * the viewport. Lab2Wrapper lays the drawer out beside the lab, so there the
   * width the drawer takes has to be real layout space the lab can measure
   * rather than an overlay the page is told to leave room for.
   */
  inline?: boolean;
}

const AI_DIFF_CLOSE_BUTTON_CLASSNAME = 'ai_diff_close_button';

const AiDiffContainer: React.FC<AiDiffContainerProps> = ({
  closeTutor,
  context,
  curriculumCourses,
  scriptName,
  unreadNotificationCount,
  inline = false,
}) => {
  // Welcome experience shut off in preparation for spring 2026 redesign.
  const [showWelcomeExperience, setShowWelcomeExperience] = useState(false);
  // The drawer always mounts regardless of this preference (see
  // Policies::Ai.ai_differentiation_eligible?) — when a teacher has turned
  // TA chat off, we instead hide the Chats tab and default elsewhere.
  const aiDifferentiationEnabled = useAppSelector(
    state => state.currentUser.aiDifferentiationEnabled
  );
  const showChats = aiDifferentiationEnabled !== false;
  const [activeNav, setActiveNav] = useState(showChats ? 'Chats' : 'Prepare');
  const showLearn = experiments.isEnabled('sidebar-prepare');
  const showTeacherPanel = useMemo(() => {
    if (!experiments.isEnabled('ta-teacher-panel')) return false;
    const el = document.querySelector<HTMLScriptElement>(
      'script[data-teacherpanel]'
    );
    if (!el?.dataset.teacherpanel) return false;
    try {
      const data = JSON.parse(el.dataset.teacherpanel) as {
        is_instructor?: boolean;
      };
      return data.is_instructor === true;
    } catch {
      return false;
    }
  }, []);
  const showRubrics = useMemo(() => {
    if (!experiments.isEnabled('rubrics-drawer')) return false;
    return !!document.querySelector('script[data-rubricdata]');
  }, []);
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
  const requestedNav = useAppSelector(state => state.aiDiffChat.requestedNav);

  useEffect(() => {
    if (requestedNav) {
      setActiveNav(requestedNav);
      dispatch(clearRequestedNav());
    }
  }, [requestedNav, dispatch]);

  const isWelcomeView =
    !hasCompletedAiDifferentiationWelcome && showWelcomeExperience;
  const drawerWidth = isWelcomeView ? DRAWER_WIDTH_WELCOME : DRAWER_WIDTH;

  // Publish the width we take so the page can make room for it; which element
  // gives up that width differs by page, so each reads it for itself rather
  // than being pushed from here (see apps/src/util/taDrawerInset.ts). An
  // inline drawer publishes nothing: it occupies real layout space, so a page
  // that also left room for it would give up the width twice.
  useEffect(() => {
    if (inline) {
      return;
    }
    setTaDrawerInset(chatIsOpen ? drawerWidth : 0);
  }, [inline, chatIsOpen, drawerWidth]);

  // The drawer unmounts on navigation away from a page that has it, and the
  // inset is a global; leave the page its full width.
  useEffect(() => () => setTaDrawerInset(0), []);

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
      content = (
        <PrepareList
          onNavigateToChats={() => {
            setActiveNav('Chats');
            setShowChatList(false);
          }}
        />
      );
    } else if (activeNav === 'Roster') {
      content = <TeacherPanelScreen />;
    } else if (activeNav === 'Rubrics') {
      content = <RubricsScreen />;
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

  const isRebranded = experiments.isEnabled('ta-teacher-panel');

  const panel = (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <AiDiffHeader
        closeTutor={closeTutor}
        closeButtonClassName={AI_DIFF_CLOSE_BUTTON_CLASSNAME}
      />
      <div
        className={classNames(
          style.fabBackgroundDrawer,
          isRebranded && style.fabBackgroundDrawerTa
        )}
      >
        {content}
      </div>
      <BottomNav
        activeLabel={activeNav}
        onNavChange={label => {
          setActiveNav(label);
          setShowChatList(label === 'Chats');
        }}
        unreadNotificationCount={unreadNotificationCount}
        rebranded={isRebranded}
        showChats={showChats}
        showLearn={showLearn}
        showTeacherPanel={showTeacherPanel}
        showRubrics={showRubrics}
      />
    </div>
  );

  if (inline) {
    // The outer box is what the surrounding flex row sees, so it animates from
    // no width to the drawer's width; the inner box holds the drawer at its
    // full width throughout, so the contents slide into view rather than
    // reflowing on every frame of the transition.
    //
    // The drawer's colors are its own, not the host page's: a dark Lab2 lab
    // wraps its tree in data-theme="Dark", and inline we sit inside that
    // wrapper rather than portaling to <body> past it. Light is the default
    // theme (see colors_codeAi.css), so this is the appearance the drawer has
    // everywhere else.
    return (
      <div
        data-theme="Light"
        className={style.inlineDrawer}
        style={{width: chatIsOpen ? drawerWidth : 0}}
        aria-hidden={!chatIsOpen}
      >
        <div className={style.inlineDrawerPanel} style={{width: drawerWidth}}>
          {panel}
        </div>
      </div>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={chatIsOpen}
      variant="persistent"
      PaperProps={{
        sx: {
          width: drawerWidth,
          top: 50,
          height: 'calc(100% - 50px)',
          // The docked paper draws its own full-height border, which runs past
          // the rounded corners of the header and nav that make up our own
          // outline. Ours is the one to keep.
          ...(isRebranded ? {border: 'none'} : {}),
        },
      }}
    >
      {panel}
    </Drawer>
  );
};

export default AiDiffContainer;
