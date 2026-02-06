import {Button} from '@code-dot-org/component-library/button';
import {throttle} from 'lodash';
import React, {useState, useCallback, useMemo, useEffect} from 'react';
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
const MIN_INSTRUCTIONS_HEIGHT = 20;
const MIN_CHAT_HEIGHT = 130; // Minimum so that user message editor is always visible + some chat.
const INITIAL_CHAT_HEIGHT = 150;

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [instructionsHeight, setInstructionsHeight] = useState<
    number | undefined
  >(undefined);
  const [chatHeight, setChatHeight] = useState<number | undefined>(
    INITIAL_CHAT_HEIGHT
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    position: rawChatHeight,
    separatorProps,
    isDragging,
  } = useResizable({
    axis: 'y',
    initial: INITIAL_CHAT_HEIGHT,
    min: MIN_CHAT_HEIGHT,
    reverse: true,
    containerRef,
  });

  const adjustInstructionsHeight = useCallback(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      return;
    }
    const availableHeight = containerElement.clientHeight - RESIZE_BAR_SIZE_PX;
    if (isCollapsed) {
      setInstructionsHeight(0);
      setChatHeight(availableHeight);
      return;
    }
    setInstructionsHeight(
      Math.max(availableHeight - rawChatHeight, MIN_INSTRUCTIONS_HEIGHT)
    );
    const newChatHeight = Math.min(
      rawChatHeight,
      availableHeight - MIN_INSTRUCTIONS_HEIGHT
    );
    setChatHeight(newChatHeight);
  }, [rawChatHeight, setChatHeight, setInstructionsHeight, isCollapsed]);

  const throttledAdjustInstructionsHeight = useMemo(
    () =>
      throttle(() => {
        adjustInstructionsHeight();
      }, 30),
    [adjustInstructionsHeight]
  );

  useEffect(() => {
    throttledAdjustInstructionsHeight();
  }, [throttledAdjustInstructionsHeight]);

  const toggleInstructions = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
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
            style={{top: instructionsHeight}}
            onClick={toggleInstructions}
            text="Hide Instructions"
            type="tertiary"
            size="xs"
            color="black"
          />
          <ResizeBar
            isVertical={false}
            separatorProps={separatorProps}
            isDragging={isDragging}
          />
        </>
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
