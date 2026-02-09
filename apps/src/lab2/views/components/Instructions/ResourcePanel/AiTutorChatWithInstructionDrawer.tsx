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
const DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT = 250;

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
  const instructionsContentRef = React.useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);
  const [instructionsHeight, setInstructionsHeight] = useState<
    number | undefined
  >(DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT);
  const [maxInstructionsHeight, setMaxInstructionsHeight] = useState<
    number | undefined
  >(undefined);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toggleButtonText, setToggleButtonText] = useState('Hide Instructions');

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
        <div ref={instructionsContentRef}>{instructionsContent}</div>
      </div>
      <div
        className={styles.toggleButtonContainer}
        style={{top: instructionsHeight}}
      >
        <Button
          className={styles.toggleButton}
          onClick={toggleInstructions}
          text={toggleButtonText}
          type="tertiary"
          size="xs"
          color="black"
          iconLeft={{iconName: 'info-circle', iconStyle: 'solid'}}
          iconRight={{
            iconName: isCollapsed ? 'chevron-down' : 'chevron-up',
            iconStyle: 'solid',
          }}
        />
      </div>
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
        }}
      >
        <div
          style={{
            height: '100%',
            paddingTop: isCollapsed ? '40px' : '0',
            boxSizing: 'border-box',
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
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
