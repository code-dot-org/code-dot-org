import {Button} from '@code-dot-org/component-library/button';
import {throttle} from 'lodash';
import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {useResizable} from 'react-resizable-layout';

import {ChatButtonData, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import ResizeBar, {
  RESIZE_BAR_SIZE_PX,
} from '@cdo/apps/lab2/views/components/layout/ResizeBar';

import styles from './ai-tutor-chat-with-instructions-drawer.module.scss';

interface AiTutorChatWithInstructionDrawerProps {
  hiddenContextCallback: () => Promise<string>;
  aiTutorMultimodalEnabled?: boolean;
  levelName?: string;
  channelId?: string;
  aiTutorChatButtonData?: ChatButtonData[];
  aiTutorSystemPromptName?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  instructionsContent?: React.ReactNode;
}

const MIN_CHAT_HEIGHT = 130; // Minimum so that user message editor is always visible + some chat.
const MIN_INSTRUCTIONS_HEIGHT = 150;
const DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT = 250;

const TOGGLE_BUTTON_ICONS = {
  left: {iconName: 'info-circle', iconStyle: 'solid'} as const,
  collapsed: {iconName: 'chevron-down', iconStyle: 'solid'} as const,
  expanded: {iconName: 'chevron-up', iconStyle: 'solid'} as const,
};

const AiTutorChatWithInstructionDrawer: React.FunctionComponent<
  AiTutorChatWithInstructionDrawerProps
> = ({
  hiddenContextCallback,
  aiTutorMultimodalEnabled,
  levelName,
  channelId,
  aiTutorChatButtonData,
  aiTutorSystemPromptName,
  aiTutorResponseSchemaSettings,
  instructionsContent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instructionsContentRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);
  const [instructionsHeight, setInstructionsHeight] = useState<
    number | undefined
  >(DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT);
  const [maxInstructionsHeight, setMaxInstructionsHeight] = useState<
    number | undefined
  >(undefined);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    position: rawInstructionsHeight,
    separatorProps,
    isDragging,
    setPosition: setRawInstructionsHeight,
  } = useResizable({
    axis: 'y',
    initial: DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT,
    min: MIN_INSTRUCTIONS_HEIGHT,
    max: maxInstructionsHeight,
    containerRef,
  });

  const adjustChatHeight = useCallback(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      return;
    }
    const availableHeight = containerElement.clientHeight - RESIZE_BAR_SIZE_PX;
    if (isCollapsed) {
      setChatHeight(availableHeight);
      setInstructionsHeight(0);
      return;
    }
    setChatHeight(
      Math.max(availableHeight - rawInstructionsHeight, MIN_CHAT_HEIGHT)
    );
    const newInstructionsHeight = Math.min(
      rawInstructionsHeight,
      availableHeight - MIN_CHAT_HEIGHT
    );
    setInstructionsHeight(newInstructionsHeight);
  }, [isCollapsed, rawInstructionsHeight]);

  const throttledAdjustChatHeight = useMemo(
    () => throttle(adjustChatHeight, 30),
    [adjustChatHeight]
  );

  useEffect(() => {
    throttledAdjustChatHeight();
    return () => throttledAdjustChatHeight.cancel();
  }, [throttledAdjustChatHeight]);

  // Listen for window resize events
  useEffect(() => {
    window.addEventListener('resize', throttledAdjustChatHeight);
    return () => {
      window.removeEventListener('resize', throttledAdjustChatHeight);
    };
  }, [throttledAdjustChatHeight]);

  // Measure the instructions content height once when loaded
  // and adjust the initial height if content is smaller.
  useEffect(() => {
    const instructionsContentElement = instructionsContentRef.current;
    if (!instructionsContentElement) {
      return;
    }

    const contentHeight = instructionsContentElement.scrollHeight;
    setMaxInstructionsHeight(contentHeight);

    // If content is smaller than initial height, adjust to fit content.
    if (contentHeight < DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT) {
      setRawInstructionsHeight(contentHeight);
    }
  }, [instructionsContent, setRawInstructionsHeight]);

  const toggleInstructions = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={styles.instructionsDrawer}
        style={{height: instructionsHeight}}
      >
        <div className={styles.instructionsScrollArea}>
          <div ref={instructionsContentRef}>{instructionsContent}</div>
        </div>
      </div>
      <div
        className={styles.toggleButtonContainer}
        style={{top: instructionsHeight}}
      >
        <Button
          className={styles.toggleButton}
          onClick={toggleInstructions}
          text={isCollapsed ? 'Show Instructions' : 'Hide Instructions'}
          type="tertiary"
          size="xs"
          color="black"
          iconLeft={TOGGLE_BUTTON_ICONS.left}
          iconRight={
            isCollapsed
              ? TOGGLE_BUTTON_ICONS.collapsed
              : TOGGLE_BUTTON_ICONS.expanded
          }
        />
      </div>
      {!isCollapsed && (
        <ResizeBar
          isVertical={false}
          separatorProps={separatorProps}
          isDragging={isDragging}
        />
      )}
      <div className={styles.chatPanel} style={{height: chatHeight}}>
        <div className={styles.chatContent}>
          <AiTutorChat
            hiddenContextCallback={hiddenContextCallback}
            aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
            levelName={levelName}
            channelId={channelId}
            aiTutorChatButtonData={aiTutorChatButtonData}
            aiTutorSystemPromptName={aiTutorSystemPromptName}
            aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
