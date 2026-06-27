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

  // Animate the layout (drawer resize, chat reveal/fade, toggle slide) while the
  // drawer is open and across the close-settle window, so the open/close toggle
  // animates in both directions.
  const [drawerSettledClosed, setDrawerSettledClosed] = useState(isCollapsed);
  useEffect(() => {
    if (!isCollapsed) {
      setDrawerSettledClosed(false);
      return;
    }
    const id = setTimeout(() => setDrawerSettledClosed(true), 220);
    return () => clearTimeout(id);
  }, [isCollapsed]);

  // Also animate around a tab switch, so switching to/from a collapsed AI Tutor
  // tab rolls the instructions down to 0 (or back up to full) rather than cutting.
  // `tabSwitching` is derived during render (before the effect updates the ref),
  // so the transition is already live on the very frame the drawer height changes
  // — an effect-set flag arrives a frame late, after the height has jumped.
  // `animatingTabSwitch` then keeps it live for the rest of the animation so the
  // transition isn't cancelled when `.instant` would otherwise return.
  const previousAiTutorActiveRef = useRef(aiTutorActive);
  const tabSwitching = previousAiTutorActiveRef.current !== aiTutorActive;
  const [animatingTabSwitch, setAnimatingTabSwitch] = useState(false);
  useEffect(() => {
    if (previousAiTutorActiveRef.current === aiTutorActive) {
      return;
    }
    previousAiTutorActiveRef.current = aiTutorActive;
    setAnimatingTabSwitch(true);
    const id = setTimeout(() => setAnimatingTabSwitch(false), 220);
    return () => clearTimeout(id);
  }, [aiTutorActive]);

  const animateLayout =
    !isCollapsed || !drawerSettledClosed || tabSwitching || animatingTabSwitch;

  // Size each state's drawer height synchronously (0 hidden, full on the
  // Instructions tab), not from the frame-late instructionsHeight, so the height —
  // and the transition's target — is right on the first frame and the roll
  // animates cleanly to it rather than via a stale intermediate. Only the open,
  // resizable drawer uses the (animating) instructionsHeight.
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
