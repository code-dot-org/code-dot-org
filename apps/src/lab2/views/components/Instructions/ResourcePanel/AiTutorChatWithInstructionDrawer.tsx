import {Button} from '@code-dot-org/component-library/button';
import {throttle} from 'lodash';
import React, {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {useResizable} from 'react-resizable-layout';

import {ChatButtonData, ResponseSchemaSettings} from '@cdo/apps/aichat/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import ResizeBar, {
  RESIZE_BAR_SIZE_PX,
} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

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
  isCollapsedByDefault: boolean;
}

const MIN_CHAT_HEIGHT = 133; // Minimum so that user message editor is always visible + some chat.
const MIN_INSTRUCTIONS_HEIGHT = 150;
const DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT = 250; // Initial height needed before instructions content is measured.
// Matches .instructionsDrawer padding (8px top + 8px bottom).
const INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX = 16;

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
  isCollapsedByDefault,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instructionsContentRef = useRef<HTMLDivElement>(null);
  const instructionsHeightAtDragStartRef = useRef<number | null>(null);
  const [chatHeight, setChatHeight] = useState<number | undefined>(undefined);
  const [instructionsHeight, setInstructionsHeight] = useState<
    number | undefined
  >(DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT);
  const [maxInstructionsHeight, setMaxInstructionsHeight] = useState<
    number | undefined
  >(undefined);
  const [isCollapsed, setIsCollapsed] = useState(isCollapsedByDefault);

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
    onResizeStart: () => {
      instructionsHeightAtDragStartRef.current = rawInstructionsHeight;
    },
  });

  // Report increase/decrease when drag ends; use effect so we read the final
  // position after state has updated (avoids stale closure in onResizeEnd).
  useEffect(() => {
    if (!isDragging && instructionsHeightAtDragStartRef.current !== null) {
      const startHeight = instructionsHeightAtDragStartRef.current;
      instructionsHeightAtDragStartRef.current = null;
      const endHeight = rawInstructionsHeight;
      const eventToReport =
        endHeight > startHeight
          ? EVENTS.RESOURCE_PANEL_INSTRUCTIONS_DRAWER_RESIZED_INCREASED
          : EVENTS.RESOURCE_PANEL_INSTRUCTIONS_DRAWER_RESIZED_DECREASED;
      if (endHeight !== startHeight) {
        sendLab2AnalyticsEvent(eventToReport, {
          startHeight: startHeight,
          endHeight: endHeight,
        });
      }
    }
  }, [isDragging, rawInstructionsHeight]);

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

  // Listen for window resize events.
  useEffect(() => {
    window.addEventListener('resize', throttledAdjustChatHeight);
    return () => {
      window.removeEventListener('resize', throttledAdjustChatHeight);
    };
  }, [throttledAdjustChatHeight]);

  useEffect(() => {
    setIsCollapsed(isCollapsedByDefault);
  }, [isCollapsedByDefault]);

  // Measure the instructions content height on load and when it changes,
  // (e.g., details elements expanded/collapsed), and set the drawer height to match.
  useEffect(() => {
    // Skip if instructions drawer is collapsed (unmounted).
    if (isCollapsed) {
      return;
    }

    const instructionsContentElement = instructionsContentRef.current;
    if (!instructionsContentElement) {
      return;
    }

    const updateMaxHeight = () => {
      const contentHeight = instructionsContentElement.scrollHeight;

      if (contentHeight > 0) {
        // Include drawer padding so the scroll area height matches content (no extra scroll).
        const drawerHeight =
          contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX;
        setMaxInstructionsHeight(drawerHeight);
        setRawInstructionsHeight(drawerHeight);
      }
    };

    updateMaxHeight();

    // Watch for size changes (e.g., when details elements expand/collapse).
    const resizeObserver = new ResizeObserver(() => {
      updateMaxHeight();
    });

    resizeObserver.observe(instructionsContentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [setRawInstructionsHeight, isCollapsed]);

  const toggleInstructions = useCallback(() => {
    const eventToReport = isCollapsed
      ? EVENTS.RESOURCE_PANEL_INSTRUCTIONS_DRAWER_EXPANDED
      : EVENTS.RESOURCE_PANEL_INSTRUCTIONS_DRAWER_COLLAPSED;
    sendLab2AnalyticsEvent(eventToReport);
    setIsCollapsed(prev => !prev);
  }, [isCollapsed]);

  return (
    <div ref={containerRef} className={styles.container}>
      {!isCollapsed && (
        <div
          id="instructions-drawer"
          className={styles.instructionsDrawer}
          style={{height: instructionsHeight}}
        >
          <div className={styles.instructionsScrollArea}>
            <div ref={instructionsContentRef}>{instructionsContent}</div>
          </div>
        </div>
      )}
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
            hasInstructionsDrawer={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
