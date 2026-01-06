import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import {ChatEvent, isChatMessage} from '../types';

const BOTTOM_BUFFER = 16;

const toPixels = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const useChatEventsScrollHandler = (events: ChatEvent[]) => {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const spacerHeightRef = useRef(0);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const prevEventsCount = useRef(events.length);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  const isAtBottom = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return false;
    }

    return (
      container.scrollTop + container.clientHeight + BOTTOM_BUFFER >=
      container.scrollHeight
    );
  }, []);

  const updateSpacerAndScroll = useCallback(
    (preventScroll: boolean) => {
      let container = containerRef.current;
      const spacer = spacerRef.current;
      const anchorElement = lastUserMessageRef.current;

      if (!container || !spacer) {
        return;
      }

      if (!anchorElement || !container.contains(anchorElement)) {
        if (spacerHeightRef.current !== 0) {
          spacerHeightRef.current = 0;
          spacer.style.height = '0px';
        }
        lastUserMessageRef.current = null;
        return;
      }

      const containerHeight = container.clientHeight;
      const containerStyle = getComputedStyle(container);
      const paddingTop = toPixels(containerStyle.paddingTop);
      const paddingBottom = toPixels(containerStyle.paddingBottom);

      // the height of the space between the top of the user message
      // to the bottom of the pending assistant message
      const contentHeightBelowAnchor =
        spacer.offsetTop - anchorElement.offsetTop;

      // we want enough space so that 'contentHeightBelowAnchor' + spacer fills the container
      // minus the vertical container padding
      const desiredSpacerHeight = Math.max(
        0,
        containerHeight - contentHeightBelowAnchor - paddingTop - paddingBottom
      );

      if (Math.abs(desiredSpacerHeight - spacerHeightRef.current) > 1) {
        spacerHeightRef.current = desiredSpacerHeight;
        spacer.style.height = `${desiredSpacerHeight}px`;
      }

      // scroll is prevented when last message is from the assistant
      // check if assistant message overflows container and needs scroll
      // to bottom button
      if (preventScroll) {
        setShowScrollToBottom(!isAtBottom());
        return;
      }

      requestAnimationFrame(() => {
        // re-measure after DOM update
        container = containerRef.current;

        if (!container) {
          return;
        }

        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
        setShowScrollToBottom(!isAtBottom());
      });
    },
    [isAtBottom]
  );

  useLayoutEffect(() => {
    // initial load of chat history
    if (events.length && !prevEventsCount.current) {
      prevEventsCount.current = events.length;
      scrollToBottom('auto');
      return;
    }

    // new chat message
    if (events.length !== prevEventsCount.current) {
      prevEventsCount.current = events.length;

      // do not scroll unless last message is from the user
      const lastEvent = events[events.length - 1];
      const preventScroll = !(
        lastEvent &&
        isChatMessage(lastEvent) &&
        lastEvent.role === Role.USER
      );

      updateSpacerAndScroll(preventScroll);
    }
  }, [events, scrollToBottom, updateSpacerAndScroll]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleUserScroll = () => {
      setShowScrollToBottom(!isAtBottom());
    };

    container.addEventListener('scroll', handleUserScroll);
    handleUserScroll();

    return () => {
      container?.removeEventListener('scroll', handleUserScroll);
    };
  }, [isAtBottom]);

  return {
    containerRef,
    lastUserMessageRef,
    spacerRef,
    showScrollToBottom,
    scrollToBottom,
  };
};
