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
const MIN_CHAT_HEIGHT = 130; // Minimum so that user message editor is always visible + some chat.
const MIN_INSTRUCTIONS_HEIGHT = 150;
const INITIAL_INSTRUCTIONS_HEIGHT = 250;

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
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);
  const [instructionsHeight, setInstructionsHeight] = useState<
    number | undefined
  >(INITIAL_INSTRUCTIONS_HEIGHT);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toggleButtonText, setToggleButtonText] = useState('Hide Instructions');

  const {
    position: rawInstructionsHeight,
    separatorProps,
    isDragging,
  } = useResizable({
    axis: 'y',
    initial: INITIAL_INSTRUCTIONS_HEIGHT,
    min: MIN_INSTRUCTIONS_HEIGHT,
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
  }, [
    isCollapsed,
    rawInstructionsHeight,
    setChatHeight,
    setInstructionsHeight,
  ]);

  const throttledAdjustChatHeight = useMemo(
    () =>
      throttle(() => {
        adjustChatHeight();
      }, 30),
    [adjustChatHeight]
  );

  useEffect(() => {
    throttledAdjustChatHeight();
  }, [throttledAdjustChatHeight]);

  const toggleInstructions = useCallback(() => {
    setIsCollapsed(prev => !prev);
    setToggleButtonText(prev =>
      prev === 'Hide Instructions' ? 'Show Instructions' : 'Hide Instructions'
    );
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
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
        text={toggleButtonText}
        type="tertiary"
        size="xs"
        color="black"
      />
      {!isCollapsed && (
        <ResizeBar
          isVertical={false}
          separatorProps={separatorProps}
          isDragging={isDragging}
        />
      )}
      <div
        className={styles.chatPanel}
        style={{
          height: chatHeight,
          paddingTop: isCollapsed ? '40px' : '0',
        }}
      >
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
