import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import {ChatEvent, isChatMessage} from '../types';

const BOTTOM_BUFFER = 16;
const MESSAGE_AREA_VERTICAL_PADDING = 20;

export const useChatEventsScrollHandler = (events: ChatEvent[]) => {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);

  // Ref tracking to avoid re-renders
  const stateRef = useRef({
    spacerHeight: 0,
    prevEventsCount: events.length,
    prevAssistantLength: 0,
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

    const contentHeightBelowAnchor = spacer.offsetTop - anchor.offsetTop;
    const desiredHeight = Math.max(
      0,
      containerHeight - contentHeightBelowAnchor - MESSAGE_AREA_VERTICAL_PADDING
    );

    if (Math.abs(desiredHeight - stateRef.current.spacerHeight) > 1) {
      stateRef.current.spacerHeight = desiredHeight;
      spacer.style.height = `${desiredHeight}px`;
    }
  }, []);

  // Handle Window/Container Resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => updateSpacer());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateSpacer]);

  useLayoutEffect(() => {
    const {prevEventsCount, prevAssistantLength} = stateRef.current;
    const currentEvent = events[events.length - 1];
    if (!currentEvent) return;

    const isNewEvent = events.length !== prevEventsCount;

    // 1. Initial Load
    if (events.length && !prevEventsCount) {
      stateRef.current.prevEventsCount = events.length;
      scrollToBottom('auto');
      return;
    }

    // 2. Streaming Assistant Message
    if (
      !isNewEvent &&
      isChatMessage(currentEvent) &&
      currentEvent.role === Role.ASSISTANT
    ) {
      if (currentEvent.chatMessageText.length > prevAssistantLength) {
        stateRef.current.prevAssistantLength =
          currentEvent.chatMessageText.length;
        updateSpacer();
        setShowScrollToBottom(!isAtBottom());
      }
    }

    // 3. New Message Added (User or Assistant)
    if (isNewEvent) {
      stateRef.current.prevEventsCount = events.length;
      updateSpacer();

      const currentEventFromUser =
        isChatMessage(currentEvent) && currentEvent.role === Role.USER;
      if (currentEventFromUser) {
        stateRef.current.prevAssistantLength = 0;
        scrollToBottom();
      } else {
        setShowScrollToBottom(!isAtBottom());
      }
    }
  }, [events, updateSpacer, isAtBottom, scrollToBottom]);

  // Scroll Listener for the Button
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
    spacerRef,
    showScrollToBottom,
    scrollToBottom,
  };
};
