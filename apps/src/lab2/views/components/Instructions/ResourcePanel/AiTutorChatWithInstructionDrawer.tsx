import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
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
  aiTutorSystemPrompt?: string;
  aiTutorResponseSchemaSettings?: ResponseSchemaSettings;
  instructionsContent?: React.ReactNode;
  isCollapsedByDefault: boolean;
}

const MIN_CHAT_HEIGHT = 133; // Minimum so that user message editor is always visible + some chat.
const MIN_INSTRUCTIONS_HEIGHT = 150;
const DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT = 250; // Initial height needed before instructions content is measured.
// Matches .instructionsDrawer padding (8px top + 8px bottom).
const INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX = 16;

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
  isCollapsedByDefault,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instructionsContentRef = useRef<HTMLDivElement>(null);
  const instructionsHeightAtDragStartRef = useRef<number | null>(null);
  const hasSetInitialHeightFromContentRef = useRef(false);
  const rawInstructionsHeightRef = useRef<number>(
    DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT
  );
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

  // Reset so that when drawer is expanded again, we set height from content.
  useEffect(() => {
    if (isCollapsed) {
      hasSetInitialHeightFromContentRef.current = false;
    }
  }, [isCollapsed]);

  // Keep ref in sync with current height.
  useEffect(() => {
    rawInstructionsHeightRef.current = rawInstructionsHeight;
  }, [rawInstructionsHeight]);

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
      const currentHeight = rawInstructionsHeightRef.current;
      setMaxInstructionsHeight(contentHeight);

      // Set initial drawer height to full content height (maxInstructionsHeight).
      if (!hasSetInitialHeightFromContentRef.current) {
        hasSetInitialHeightFromContentRef.current = true;
        setRawInstructionsHeight(
          contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX
        );
        return;
      }

      // Auto-adjust drawer height when new content height is less than the current drawer height.
      // This will remove a gap betwen instructions and drawer's edge.
      if (contentHeight < currentHeight) {
        setRawInstructionsHeight(
          contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX
        );
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
        <MuiButton
          variant="text"
          color="secondary"
          size="extraSmall"
          className={styles.toggleButton}
          onClick={toggleInstructions}
          type="button"
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
      {!isCollapsed && (
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
      <div className={styles.chatPanel} style={{height: chatHeight}}>
        <div className={styles.chatContent}>
          <AiTutorChat
            hiddenContextCallback={hiddenContextCallback}
            aiTutorMultimodalEnabled={aiTutorMultimodalEnabled}
            levelName={levelName}
            channelId={channelId}
            aiTutorChatButtonData={aiTutorChatButtonData}
            aiTutorSystemPrompt={aiTutorSystemPrompt}
            aiTutorResponseSchemaSettings={aiTutorResponseSchemaSettings}
            hasInstructionsDrawer={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AiTutorChatWithInstructionDrawer;
