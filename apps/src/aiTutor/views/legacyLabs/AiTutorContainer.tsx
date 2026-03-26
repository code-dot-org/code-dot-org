import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React, {FC, useEffect, useRef, useState} from 'react';

import {fetchUserChatHistory} from '@cdo/apps/aichat/redux';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import {LegacyLabsState} from '@cdo/apps/redux/legacyLabs';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {
  defaultPrompts,
  levelPrompts,
  standaloneProjectPrompts,
} from '../../suggestedPrompts';

import {
  AiTutorLegacyLabContextHelper,
  AiTutorLegacyLabParams,
} from './aiTutorContextHelper';
import AiTutorSidebar from './AiTutorSidebar';

import styles from './AiTutorContainer.module.scss';

const aiTutorHelper = new AiTutorLegacyLabContextHelper();

interface Level {
  longInstructions?: string;
  hideSource?: boolean;
}

interface CommonLab {
  getCode?: () => Promise<string | undefined>;
  channel?: string;
  level?: Level;
  hideSource?: boolean;
}

export const AiTutorContainer: FC<{
  shouldShowTutor: boolean;
  onLayoutChange: (state: {isVisible: boolean; isOpen: boolean}) => void;
}> = ({shouldShowTutor, onLayoutChange}) => {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const dispatch = useAppDispatch();

  const labState = useAppSelector(
    (state: {pageConstants: LegacyLabsState}) => state.pageConstants
  );

  // When a teacher is viewing a student, viewAsUserId is set.
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  const lab: CommonLab | undefined =
    labState.appType === 'weblab' ? window.getWebLab?.() : studioApp()?.config;

  // When chat is disabled but a teacher is viewing a student, eagerly fetch the
  // student's history so we can decide whether to show the component before
  // ChatWorkspace mounts.
  useEffect(() => {
    if (!shouldShowTutor && viewAsUserId) {
      dispatch(
        fetchUserChatHistory({
          userId: viewAsUserId,
          isOwnHistory: false,
          channelId: lab?.channel,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasChatHistory = useAppSelector(
    state => state.aichat.studentChatHistory.length > 0
  );

  // Use a ref so visibility doesn't flip back to false when ChatWorkspace
  // calls clearChatMessages on its own mount (before its re-fetch completes).
  const hasEverHadHistory = useRef(false);
  if (hasChatHistory) {
    hasEverHadHistory.current = true;
  }

  const isVisible = shouldShowTutor || hasEverHadHistory.current;

  useEffect(() => {
    onLayoutChange({isVisible, isOpen: aiChatOpen});
  }, [isVisible, aiChatOpen, onLayoutChange]);

  if (!isVisible) {
    return null;
  }

  const toggleAiChat = () => setAiChatOpen(open => !open);

  const inLevel = !!labState.serverScriptId;
  const allPrompts = inLevel
    ? [...levelPrompts, ...defaultPrompts]
    : [...standaloneProjectPrompts, ...defaultPrompts];

  const getHiddenContext = async () => {
    const params: AiTutorLegacyLabParams = {
      longInstructions: lab?.level?.longInstructions,
      labType: labState.appType,
    };

    const sourceCode = await lab?.getCode?.();
    const hideSource = lab?.hideSource ?? lab?.level?.hideSource ?? false;
    const readOnly = labState.isReadOnlyWorkspace;

    if (hideSource) {
      params.hiddenSourceCode = sourceCode;
    } else if (readOnly) {
      params.readOnlySourceCode = sourceCode;
    } else {
      params.sourceCode = sourceCode;
    }
    aiTutorHelper.setAiTutorContext(params);
    const callback = aiTutorHelper.getHiddenContextCallback();
    return callback();
  };

  const analyticsData = {
    labType: labState.appType,
    channelId: labState.channelId,
    location: window.location.href,
    levelId: labState.serverLevelId,
    unitId: labState.serverScriptId,
  };

  return (
    <>
      <div
        className={classNames(styles.container, {
          [styles.displayNone]: !aiChatOpen,
        })}
      >
        <div className={styles.header}>
          <img
            src={aiBotOutlineIcon}
            alt=""
            className={styles['mini-bot-icon']}
          />
          <Typography className={styles['header-text']} variant="body3">
            AI Tutor
          </Typography>
          <MuiIconButton
            variant="text"
            color="secondary"
            size="extraSmall"
            onClick={toggleAiChat}
            aria-label="Close AI tutor"
            type="button"
          >
            <FontAwesomeV6Icon iconName="dash" />
          </MuiIconButton>
        </div>
        <AiTutorChat
          hiddenContextCallback={getHiddenContext}
          aiTutorChatButtonData={allPrompts}
          channelId={lab?.channel}
        />
      </div>
      <div
        className={classNames({
          [styles.displayNone]: aiChatOpen,
        })}
      >
        <AiTutorSidebar
          toggleAiChat={toggleAiChat}
          suggestedPrompts={allPrompts}
          hiddenContextCallback={getHiddenContext}
          analyticsData={analyticsData}
        />
      </div>
    </>
  );
};
