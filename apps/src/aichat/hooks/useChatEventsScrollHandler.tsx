import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import {ChatEvent, isChatMessage} from '../types';

const BOTTOM_BUFFER = 16;
const MESSAGE_AREA_VERTICAL_PADDING = 20;

type StateRefType = {
  spacerHeight: number;
  prevEventsCount: number;
  containerResizeInitialized: boolean;
  messageResizeInitialized: boolean;
};

export const useChatEventsScrollHandler = (events: ChatEvent[]) => {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const activeMessageRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef<StateRefType>({
    spacerHeight: 0,
    prevEventsCount: events.length,
    containerResizeInitialized: false,
    messageResizeInitialized: false,
  });

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  }, []);

  const isAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;
    return (
      container.scrollTop + container.clientHeight + BOTTOM_BUFFER >=
      container.scrollHeight
    );
  }, []);

  const updateSpacer = useCallback(() => {
    const container = containerRef.current;
    const spacer = spacerRef.current;
    const anchor = lastUserMessageRef.current;

    if (!container || !spacer || !anchor) {
      if (spacer && stateRef.current.spacerHeight !== 0) {
        spacer.style.height = '0px';
        stateRef.current.spacerHeight = 0;
      }
      return;
    }

    const containerHeight = container.clientHeight;

    // as the active message grows, spacer.offsetTop increases,
    // contentHeightBelowAnchor increases, and desiredHeight decreases.
    const contentHeightBelowAnchor = spacer.offsetTop - anchor.offsetTop;

    const desiredHeight = Math.max(
      0,
      containerHeight - contentHeightBelowAnchor - MESSAGE_AREA_VERTICAL_PADDING
    );

    if (Math.abs(desiredHeight - stateRef.current.spacerHeight) > 1) {
      stateRef.current.spacerHeight = desiredHeight;
      // direct DOM manipulation prevents render loops
      spacer.style.height = `${desiredHeight}px`;
    }
  }, []);

  const handleResize = useCallback(
    (
      stateRefKey: 'containerResizeInitialized' | 'messageResizeInitialized'
    ) => {
      // on resize, only update the spacer if both resize observers
      // have been initialized
      if (stateRef.current[stateRefKey]) {
        updateSpacer();
      } else {
        stateRef.current[stateRefKey] = true;
      }

      setShowScrollToBottom(!isAtBottom());
    },
    [isAtBottom, updateSpacer]
  );

  // window/container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() =>
      handleResize('containerResizeInitialized')
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleResize]);

  // message resizing (streaming)
  useEffect(() => {
    const currentMessage = activeMessageRef.current;
    if (!currentMessage) return;

    const observer = new ResizeObserver(() =>
      handleResize('messageResizeInitialized')
    );

    observer.observe(currentMessage);
    return () => observer.disconnect();
  }, [events.length, handleResize]);

  useLayoutEffect(() => {
    const {prevEventsCount} = stateRef.current;
    const currentEvent = events[events.length - 1];

    const initialLoadOfEvents = !prevEventsCount && events.length;
    const newEventOrChatCleared =
      prevEventsCount && events.length !== prevEventsCount;

    stateRef.current.prevEventsCount = events.length;

    if (initialLoadOfEvents) {
      //  jump to bottom of messages
      scrollToBottom('auto');
    } else if (newEventOrChatCleared) {
      updateSpacer();

      const currentEventFromUser =
        currentEvent &&
        isChatMessage(currentEvent) &&
        currentEvent.role === Role.USER;

      if (currentEventFromUser) {
        scrollToBottom();
      } else {
        setShowScrollToBottom(!isAtBottom());
      }
    }
  }, [events, updateSpacer, isAtBottom, scrollToBottom]);

  // scroll listener for scroll to bottom button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => setShowScrollToBottom(!isAtBottom());
    container.addEventListener('scroll', handleScroll, {passive: true});
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isAtBottom]);

  return {
    containerRef,
    lastUserMessageRef,
    activeMessageRef,
    spacerRef,
    showScrollToBottom,
    scrollToBottom,
  };
};
