import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import AiTutorChat, {
  AiTutorChatProps,
} from '@cdo/apps/lab2/views/components/AiTutorChat';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import Spotlight from '@cdo/apps/lab2/views/components/Spotlight';

import {useInstructionsDrawer} from './useInstructionsDrawer';

import styles from './ai-tutor-chat-with-instructions-drawer.module.scss';

type AiTutorChatWithInstructionDrawerProps = Omit<
  AiTutorChatProps,
  'hasInstructionsDrawer'
> & {
  instructionsContent?: React.ReactNode;
  // The instructions as authored, in markdown. Pinned, they are shown as a
  // message from the tutor in place of instructionsContent.
  instructionsText?: string;
  isPredictLevel?: boolean;
  // True when the AI Tutor tab is selected. This component is shared with the
  // Instructions tab (where it renders instructions only); the chat and the
  // Hide/Show Instructions toggle fade in only when the AI Tutor tab is active.
  aiTutorActive: boolean;
  // The instructions stay open above the chat, with no Show/Hide toggle and
  // no resize bar; with instructionsText, as a message from the tutor.
  instructionsPinned?: boolean;
  // Spotlight the pinned instructions once, when the drawer mounts.
  spotlightInstructions?: boolean;
};

// Gray, so students do not read the instructions as the tutor speaking.
const instructionsMessageStyles = {
  'message-assistant': styles.instructionsMessage,
};

const AiTutorChatWithInstructionDrawer: React.FunctionComponent<
  AiTutorChatWithInstructionDrawerProps
> = ({
  instructionsContent,
  instructionsText,
  isPredictLevel,
  aiTutorActive,
  instructionsPinned = false,
  spotlightInstructions = false,
  ...aiTutorChatProps
}) => {
  const instructionsAsMessage = instructionsPinned && !!instructionsText;
  const [spotlightDone, setSpotlightDone] = useState(false);
  const endSpotlight = useCallback(() => setSpotlightDone(true), []);
  const spotlit =
    spotlightInstructions && instructionsAsMessage && !spotlightDone;
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
  } = useInstructionsDrawer({
    isPredictLevel,
    aiTutorActive,
    pinned: instructionsPinned,
  });

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

  // Keep the drawer mounted while hidden (height 0) so switching back doesn't
  // remount it and replay the slide-in; inert while hidden so its links aren't
  // tabbable.
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

  // Animate the roll on a tab switch too. tabSwitching is derived during render so
  // the transition is live on the frame the height changes (an effect flag lands a
  // frame late); animatingTabSwitch then holds it on for the rest of the roll.
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

  // Hidden (0) and full heights are derived synchronously so the first frame is
  // right; only the open drawer uses the frame-late instructionsHeight.
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
          <div ref={instructionsContentRef}>
            {instructionsAsMessage ? (
              <ChatMessage
                role={Role.ASSISTANT}
                text={instructionsText!}
                customStyles={instructionsMessageStyles}
              />
            ) : (
              instructionsContent
            )}
          </div>
        </div>
        {showInstructions && showScrollFade && !instructionsAsMessage && (
          <div className={styles.scrollFade} aria-hidden />
        )}
      </div>
      {spotlit && (
        <Spotlight target={instructionsDrawerRef} onDone={endSpotlight} />
      )}
      {!instructionsPinned && (
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
      )}
      {instructionsPinned && <div className={styles.divider} aria-hidden />}
      {aiTutorActive && !isCollapsed && !instructionsPinned && (
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
            {...aiTutorChatProps}
            hasInstructionsDrawer={!instructionsPinned}
          />
        </div>
      </div>
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
