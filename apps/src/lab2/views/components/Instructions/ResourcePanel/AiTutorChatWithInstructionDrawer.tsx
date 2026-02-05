import {Button} from '@code-dot-org/component-library/button';
import {throttle} from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
  isInstructionsCollapsed?: boolean;
  instructionsContent?: React.ReactNode;
}

const MIN_INSTRUCTIONS_HEIGHT = 150;
const MIN_CHAT_HEIGHT = 200;
const INITIAL_INSTRUCTIONS_HEIGHT = 300;

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
  isInstructionsCollapsed = false,
  instructionsContent,
}) => {
  const [instructionsHeight, setInstructionsHeight] = useState<
    number | undefined
  >(INITIAL_INSTRUCTIONS_HEIGHT);
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);
  const [isCollapsed, setIsCollapsed] = useState(
    isInstructionsCollapsed || false
  );

  const {
    position: rawInstructionsHeight,
    separatorProps,
    isDragging,
  } = useResizable({
    axis: 'y',
    initial: INITIAL_INSTRUCTIONS_HEIGHT,
    min: MIN_INSTRUCTIONS_HEIGHT,
  });

  const adjustPanelHeights = useCallback(() => {
    // Get the available height for panels (container height minus resize bar)
    const containerElement = document.querySelector(`.${styles.container}`);
    const availableHeight = containerElement
      ? containerElement.clientHeight - (isCollapsed ? 0 : RESIZE_BAR_SIZE_PX)
      : window.innerHeight - (isCollapsed ? 0 : RESIZE_BAR_SIZE_PX);

    if (isCollapsed) {
      // When collapsed, instructions take 0 height and chat takes full height
      setInstructionsHeight(0);
      setChatHeight(availableHeight);
    } else {
      // Calculate new heights, respecting minimum sizes
      const newInstructionsHeight = Math.max(
        Math.min(rawInstructionsHeight, availableHeight - MIN_CHAT_HEIGHT),
        MIN_INSTRUCTIONS_HEIGHT
      );

      const newChatHeight = Math.max(
        availableHeight - newInstructionsHeight,
        MIN_CHAT_HEIGHT
      );

      setInstructionsHeight(newInstructionsHeight);
      setChatHeight(newChatHeight);
    }
  }, [rawInstructionsHeight, isCollapsed]);

  // Sync internal state with prop changes
  useEffect(() => {
    setIsCollapsed(isInstructionsCollapsed || false);
  }, [isInstructionsCollapsed]);

  const throttledAdjustPanelHeights = useMemo(
    () => throttle(adjustPanelHeights, 30),
    [adjustPanelHeights]
  );

  useEffect(() => {
    throttledAdjustPanelHeights();
  }, [throttledAdjustPanelHeights]);

  useEffect(() => {
    window.addEventListener('resize', throttledAdjustPanelHeights);
    return () =>
      window.removeEventListener('resize', throttledAdjustPanelHeights);
  }, [throttledAdjustPanelHeights]);

  const toggleInstructions = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Use the raw position for button placement to avoid lag during dragging
  const buttonTop = useMemo(() => {
    if (isCollapsed) return 0;
    const containerElement = document.querySelector(`.${styles.container}`);
    const availableHeight = containerElement
      ? containerElement.clientHeight - RESIZE_BAR_SIZE_PX
      : window.innerHeight - RESIZE_BAR_SIZE_PX;
    return Math.max(
      Math.min(rawInstructionsHeight, availableHeight - MIN_CHAT_HEIGHT),
      MIN_INSTRUCTIONS_HEIGHT
    );
  }, [rawInstructionsHeight, isCollapsed]);

  return (
    <div className={styles.container}>
      {!isCollapsed && (
        <>
          <div
            className={styles.instructionsDrawer}
            style={{height: instructionsHeight}}
          >
            {instructionsContent}
          </div>
          <Button
            className={styles.toggleButton}
            style={{top: buttonTop}}
            onClick={toggleInstructions}
            text="Hide Instructions"
            aria-label="Hide instructions"
            type="tertiary"
            size="xs"
            iconRight={{iconName: 'chevron-up', iconStyle: 'solid'}}
          />
          <ResizeBar
            isVertical={false}
            separatorProps={separatorProps}
            isDragging={isDragging}
          />
        </>
      )}

      {isCollapsed && (
        <Button
          className={styles.toggleButtonCollapsed}
          onClick={toggleInstructions}
          text="Show Instructions"
          aria-label="Show instructions"
          type="tertiary"
          size="xs"
          iconRight={{iconName: 'chevron-down', iconStyle: 'solid'}}
        />
      )}

      <div className={styles.chatPanel} style={{height: chatHeight}}>
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
  );
};

export default AiTutorChatWithInstructionDrawer;
