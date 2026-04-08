import {throttle} from 'lodash';
import {useState, useCallback, useMemo, useEffect, useRef} from 'react';
import {useResizable} from 'react-resizable-layout';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {RESIZE_BAR_SIZE_PX} from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';

const MIN_CHAT_HEIGHT = 133; // Minimum so that user message editor is always visible + some chat.
const MIN_INSTRUCTIONS_HEIGHT = 150;
const DEFAULT_INITIAL_INSTRUCTIONS_HEIGHT = 250; // Initial height needed before instructions content is measured.
// Matches .instructionsDrawer padding (8px top + 8px bottom).
const INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX = 16;

interface UseInstructionsDrawerOptions {
  isCollapsedByDefault: boolean;
  isPredictLevel?: boolean;
}

export const useInstructionsDrawer = ({
  isCollapsedByDefault,
  isPredictLevel,
}: UseInstructionsDrawerOptions) => {
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

  const [containerAvailableHeight, setContainerAvailableHeight] = useState<
    number | undefined
  >(undefined);
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

  const adjustInstructionsHeight = useCallback(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      return;
    }
    const availableHeight = containerElement.clientHeight - RESIZE_BAR_SIZE_PX;
    setContainerAvailableHeight(availableHeight);
    if (isCollapsed) {
      setInstructionsHeight(0);
      return;
    }
    setInstructionsHeight(
      Math.min(rawInstructionsHeight, availableHeight - MIN_CHAT_HEIGHT)
    );
  }, [isCollapsed, rawInstructionsHeight]);

  const throttledAdjustInstructionsHeight = useMemo(
    () => throttle(adjustInstructionsHeight, 30),
    [adjustInstructionsHeight]
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
    throttledAdjustInstructionsHeight();
    return () => throttledAdjustInstructionsHeight.cancel();
  }, [throttledAdjustInstructionsHeight]);

  // Listen for window resize events.
  useEffect(() => {
    window.addEventListener('resize', throttledAdjustInstructionsHeight);
    return () => {
      window.removeEventListener('resize', throttledAdjustInstructionsHeight);
    };
  }, [throttledAdjustInstructionsHeight]);

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
          ? maxInstructionsHeightRef.current // already includes padding
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
    // Reset the flag in cleanup so the next expand always restores to appropriate height.
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
      setMaxInstructionsHeight(
        contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX
      );

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
        // Set the drawer height to 50% of the available container space,
        // but not less than the minimum height or greater than the content height + padding.
        setRawInstructionsHeight(
          Math.min(
            Math.max(availableHeight / 2, MIN_INSTRUCTIONS_HEIGHT),
            contentHeight + INSTRUCTIONS_DRAWER_VERTICAL_PADDING_PX
          )
        );
        return;
      }

      // Auto-adjust drawer height when new content height is less than the current drawer height.
      // This will remove a gap between instructions and drawer's edge.
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

  const chatHeight =
    containerAvailableHeight === undefined
      ? undefined
      : isCollapsed
      ? containerAvailableHeight
      : Math.max(
          containerAvailableHeight - (instructionsHeight ?? 0),
          MIN_CHAT_HEIGHT
        );

  return {
    containerRef,
    instructionsScrollAreaRef,
    instructionsContentRef,
    instructionsHeight,
    chatHeight,
    isCollapsed,
    showScrollFade,
    separatorProps,
    isDragging,
    toggleInstructions,
  };
};
