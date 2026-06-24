import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useRef, useState} from 'react';

import {
  AiChatDisabledState,
  ChatButtonData,
  ResponseSchemaSettings,
} from '@cdo/apps/aichat/types';
import {ChatAsset} from '@cdo/apps/aichat/types/assets';
import type {JsonVideoFileMetadata} from '@cdo/apps/jsonVideo/jsonVideoPrompt';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import {useInstructionsDrawer} from './useInstructionsDrawer';

import styles from './ai-tutor-chat-with-instructions-drawer.module.scss';

interface AiTutorChatWithInstructionDrawerProps {
  hiddenContextCallback: () => Promise<string>;
  aiTutorMultimodalEnabled?: boolean;
  levelName?: string;
  channelId?: string;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorSystemPrompt?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  instructionsContent?: React.ReactNode;
  tutorVideos?: JsonVideoFileMetadata[];
  isPredictLevel?: boolean;
  disabledState?: AiChatDisabledState;
  onAssetUploaded?: (asset: ChatAsset, assetUrl: string) => void;
  onAssetRemoved?: (asset: ChatAsset) => void;
  // True when the AI Tutor tab is selected. This component is shared with the
  // Instructions tab (where it renders instructions only); the chat and the
  // Hide/Show Instructions toggle fade in only when the AI Tutor tab is active.
  aiTutorActive: boolean;
  initialWelcomeMessage?: string;
}

const AiTutorChatWithInstructionDrawer: React.FunctionComponent<
  AiTutorChatWithInstructionDrawerProps
> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPrompt,
  aiTutorResponseSchemaSettings,
  instructionsContent,
  tutorVideos,
  isPredictLevel,
  disabledState,
  onAssetUploaded,
  onAssetRemoved,
  aiTutorActive,
  initialWelcomeMessage,
}) => {
  const {
    containerRef,
    instructionsScrollAreaRef,
    instructionsContentRef,
    instructionsHeight,
    fullHeight,
    chatContentHeight,
    isCollapsed,
    showScrollFade,
    separatorProps,
    isDragging,
    toggleInstructions,
  } = useInstructionsDrawer({isPredictLevel, aiTutorActive});

  // Keep the chat mounted across tab switches (so its state persists) but inert
  // when the Instructions tab is showing, so its hidden controls aren't tabbable.
  const chatPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatPanelRef.current) {
      chatPanelRef.current.inert = !aiTutorActive;
    }
  }, [aiTutorActive]);

  // Instructions are visible on the Instructions tab, and on the AI Tutor tab
  // unless the user has collapsed the drawer.
  const showInstructions = !aiTutorActive || !isCollapsed;

  // The instructions drawer stays mounted even while hidden (height 0), so that
  // switching back to the Instructions tab doesn't remount it and replay the
  // instructions' slide-in animation. Make it inert while hidden so its links
  // aren't tabbable.
  const instructionsDrawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (instructionsDrawerRef.current) {
      instructionsDrawerRef.current.inert = !showInstructions;
    }
  }, [showInstructions]);

  // Animate the layout (drawer resize, chat reveal, toggle slide) only while the
  // instructions drawer is open. Once it has settled closed, switching tabs is
  // instant so the chat doesn't grow in and the instructions don't slide back.
  // The settle delay spans the close animation so the open/close toggle itself
  // still animates in both directions.
  const [drawerSettledClosed, setDrawerSettledClosed] = useState(isCollapsed);
  useEffect(() => {
    if (!isCollapsed) {
      setDrawerSettledClosed(false);
      return;
    }
    const id = setTimeout(() => setDrawerSettledClosed(true), 220);
    return () => clearTimeout(id);
  }, [isCollapsed]);
  const animateLayout = !isCollapsed || !drawerSettledClosed;

  // Compute the drawer height synchronously (not from the effect-driven
  // instructionsHeight, which lags a frame) for the two "instant" states, so the
  // chat — which flex-fills the space below the drawer — is sized right on the
  // first frame: no full-height flash when switching to a closed AI Tutor tab,
  // and no lingering chat when switching back to a full-instructions tab. Only
  // the open, resizable drawer uses the (animating) instructionsHeight.
  const drawerHeight = !showInstructions
    ? 0
    : aiTutorActive
    ? instructionsHeight
    : fullHeight;

  return (
    <div
      ref={containerRef}
      className={classNames(
        styles.container,
        isDragging && styles.dragging,
        !animateLayout && styles.instant
      )}
    >
      <div
        ref={instructionsDrawerRef}
        id="instructions-drawer"
        className={styles.instructionsDrawer}
        style={{height: drawerHeight}}
        aria-hidden={!showInstructions}
      >
        <div
          ref={instructionsScrollAreaRef}
          className={styles.instructionsScrollArea}
        >
          <div ref={instructionsContentRef}>{instructionsContent}</div>
        </div>
        {showInstructions && showScrollFade && (
          <div className={styles.scrollFade} aria-hidden />
        )}
      </div>
      <div
        className={classNames(
          styles.toggleButtonContainer,
          !aiTutorActive && styles.fadeHidden
        )}
        style={{top: drawerHeight}}
        aria-hidden={!aiTutorActive}
      >
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          className={styles.toggleButton}
          onClick={toggleInstructions}
          type="button"
          tabIndex={aiTutorActive ? undefined : -1}
          startIcon={
            <FontAwesomeV6Icon iconName="info-circle" iconStyle="solid" />
          }
          endIcon={
            <FontAwesomeV6Icon
              iconName={isCollapsed ? 'chevron-down' : 'chevron-up'}
              iconStyle="solid"
            />
          }
        >
          {isCollapsed ? 'Show Instructions' : 'Hide Instructions'}
        </MuiButton>
      </div>
      {aiTutorActive && !isCollapsed && (
        <ResizeBar
          className={classNames(
            styles.resizeBar,
            isDragging && styles.resizeBarDragging
          )}
          isVertical={false}
          separatorProps={separatorProps}
          isDragging={isDragging}
        />
      )}
      <div
        ref={chatPanelRef}
        className={classNames(
          styles.chatPanel,
          !aiTutorActive && styles.fadeHidden
        )}
      >
        <div className={styles.chatContent} style={{height: chatContentHeight}}>
          <AiTutorChat
            hiddenContextCallback={hiddenContextCallback}
            aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
            levelName={levelName}
            channelId={channelId}
            aiTutorChatButtonData={aiTutorChatButtonData}
            aiTutorSystemPrompt={aiTutorSystemPrompt}
            aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
            hasInstructionsDrawer={true}
            tutorVideos={tutorVideos}
            disabledState={disabledState}
            onAssetUploaded={onAssetUploaded}
            onAssetRemoved={onAssetRemoved}
            initialWelcomeMessage={initialWelcomeMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
