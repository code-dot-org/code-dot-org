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
  isPredictLevel?: boolean;
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
  isPredictLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instructionsScrollAreaRef = useRef<HTMLDivElement>(null);
  const instructionsContentRef = useRef<HTMLDivElement>(null);
  const instructionsHeightAtDragStartRef = useRef<number | null>(null);
  const hasSetInitialHeightFromContentRef = useRef(false);
  const hasUserManuallyResizedRef = useRef(false);
  const maxInstructionsHeightRef = useRef<number | undefined>(undefined);
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
  const [showScrollFade, setShowScrollFade] = useState(false);

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
        hasUserManuallyResizedRef.current = true;
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

  const updateScrollFade = useCallback(() => {
    const el = instructionsScrollAreaRef.current;
    if (!el) {
      setShowScrollFade(false);
      return;
    }
    const visibleHeight = el.clientHeight;
    // scrollHeight is a floating point, but scrollTop is an integer so rounding up so fade isn't triggered when at bottom.
    const instructionsContentHeight = Math.ceil(el.scrollHeight);
    const scrolledFromTopDistance = el.scrollTop;
    setShowScrollFade(
      scrolledFromTopDistance + visibleHeight < instructionsContentHeight
    );
  }, []);

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

  // Keep instructions at 50% of container height as the container resizes,
  // unless the user has manually dragged the resize bar or it's a predict level.
  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement || isCollapsed || isPredictLevel) return;

    const handleContainerResize = throttle(() => {
      if (
        hasUserManuallyResizedRef.current ||
        !hasSetInitialHeightFromContentRef.current
      ) {
        return;
      }
      const availableHeight =
        containerElement.clientHeight - RESIZE_BAR_SIZE_PX;
      const halfContainer = Math.max(
        availableHeight / 2,
        MIN_INSTRUCTIONS_HEIGHT
      );
      const contentMax =
        maxInstructionsHeightRef.current !== undefined
          ? maxInstructionsHeightRef.current +
            INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX
          : halfContainer;
      setRawInstructionsHeight(Math.min(halfContainer, contentMax));
    }, 30);

    const resizeObserver = new ResizeObserver(handleContainerResize);
    resizeObserver.observe(containerElement);

    return () => {
      handleContainerResize.cancel();
      resizeObserver.disconnect();
    };
  }, [isCollapsed, isPredictLevel, setRawInstructionsHeight]);

  useEffect(() => {
    setIsCollapsed(isCollapsedByDefault);
  }, [isCollapsedByDefault]);

  // Keep refs in sync with current values.
  useEffect(() => {
    rawInstructionsHeightRef.current = rawInstructionsHeight;
  }, [rawInstructionsHeight]);

  useEffect(() => {
    maxInstructionsHeightRef.current = maxInstructionsHeight;
  }, [maxInstructionsHeight]);

  // Measure the instructions content height on load and when it changes,
  // (e.g., details elements expanded/collapsed), and set the drawer height to match.
  useEffect(() => {
    // Skip if instructions drawer is collapsed (unmounted).
    // Reset the flag in cleanup so the next expand always restores full height.
    if (isCollapsed) {
      return () => {
        hasSetInitialHeightFromContentRef.current = false;
        hasUserManuallyResizedRef.current = false;
      };
    }

    const instructionsContentElement = instructionsContentRef.current;
    if (!instructionsContentElement) {
      return;
    }

    const updateMaxHeight = () => {
      const contentHeight = instructionsContentElement.scrollHeight;
      const currentHeight = rawInstructionsHeightRef.current;
      setMaxInstructionsHeight(contentHeight);

      // Set initial drawer height to 50% of the available container space.
      // Exception is predict levels which we set to full content height.
      if (!hasSetInitialHeightFromContentRef.current) {
        hasSetInitialHeightFromContentRef.current = true;
        if (isPredictLevel) {
          setRawInstructionsHeight(
            contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX
          );
          return;
        }
        const containerElement = containerRef.current;
        const availableHeight = containerElement
          ? containerElement.clientHeight - RESIZE_BAR_SIZE_PX
          : contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX;
        setRawInstructionsHeight(
          Math.max(availableHeight / 2, MIN_INSTRUCTIONS_HEIGHT)
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
      updateScrollFade();
    });

    resizeObserver.observe(instructionsContentElement);

    return () => {
      resizeObserver.disconnect();
      // Reset so the next expand always restores full height from content.
      hasSetInitialHeightFromContentRef.current = false;
    };
  }, [setRawInstructionsHeight, isCollapsed, isPredictLevel, updateScrollFade]);

  // Re-check fade whenever drawer height changes (resize, collapse).
  useEffect(() => {
    updateScrollFade();
  }, [instructionsHeight, updateScrollFade]);

  // Re-check fade on scroll.
  useEffect(() => {
    const el = instructionsScrollAreaRef.current;
    if (!el || isCollapsed) return;
    el.addEventListener('scroll', updateScrollFade);
    return () => el.removeEventListener('scroll', updateScrollFade);
  }, [isCollapsed, updateScrollFade]);

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
          <div
            ref={instructionsScrollAreaRef}
            className={styles.instructionsScrollArea}
          >
            <div ref={instructionsContentRef}>{instructionsContent}</div>
          </div>
          {showScrollFade && <div className={styles.scrollFade} aria-hidden />}
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
