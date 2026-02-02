import {fireEvent, render, waitFor} from '@testing-library/react';
import React from 'react';

import {useChatEventsScrollHandler} from '@cdo/apps/aichat/hooks/useChatEventsScrollHandler';
import {ChatEvent, CompletedChatMessage} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

type HookState = ReturnType<typeof useChatEventsScrollHandler>;

let hookState: HookState;

const HookHarness: React.FC<{events: ChatEvent[]}> = ({events}) => {
  hookState = useChatEventsScrollHandler(events);

  return (
    <div ref={hookState.containerRef}>
      <div ref={hookState.lastUserMessageRef} />
      <div ref={hookState.activeMessageRef} />
      <div ref={hookState.spacerRef} />
    </div>
  );
};

const getHookElements = () => {
  const container = hookState.containerRef.current as HTMLDivElement;
  const anchor = hookState.lastUserMessageRef.current as HTMLDivElement;
  const active = hookState.activeMessageRef.current as HTMLDivElement;
  const spacer = hookState.spacerRef.current as HTMLDivElement;
  if (!container || !anchor || !active || !spacer) {
    throw new Error('Hook refs not set yet');
  }
  return {container, anchor, active, spacer};
};

const createMessage = (
  overrides: Partial<CompletedChatMessage> = {}
): CompletedChatMessage => ({
  timestamp: 1,
  chatMessageText: 'Hello',
  role: Role.USER,
  status: AiInteractionStatus.OK,
  requestId: 1,
  ...overrides,
});

const setContainerHeights = (
  element: HTMLElement,
  {clientHeight, scrollHeight}: {clientHeight: number; scrollHeight: number}
) => {
  Object.defineProperty(element, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
  Object.defineProperty(element, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
};

const setOffsetTop = (element: HTMLElement, offsetTop: number) => {
  Object.defineProperty(element, 'offsetTop', {
    value: offsetTop,
    configurable: true,
  });
};

const attachScrollToMock = (element: HTMLDivElement) => {
  const scrollToMock = jest.fn(({top}: ScrollToOptions) => {
    if (typeof top === 'number') {
      element.scrollTop = top;
    }
  });
  element.scrollTo = scrollToMock as unknown as typeof element.scrollTo;
  return scrollToMock;
};

describe('useChatEventsScrollHandler', () => {
  beforeEach(() => {
    hookState = undefined as unknown as HookState;
  });

  it('scrolls to bottom on initial load when events appear', () => {
    const {rerender} = render(<HookHarness events={[]} />);

    const {container} = getHookElements();
    setContainerHeights(container, {clientHeight: 200, scrollHeight: 1000});
    const scrollToMock = attachScrollToMock(container);

    const events = [createMessage({requestId: 1})];
    rerender(<HookHarness events={events} />);

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'auto',
    });
  });

  it('scrolls to bottom when a new user message is added', () => {
    const {rerender} = render(
      <HookHarness
        events={[createMessage({role: Role.ASSISTANT, requestId: 1})]}
      />
    );

    const {container} = getHookElements();
    setContainerHeights(container, {clientHeight: 200, scrollHeight: 800});
    const scrollToMock = attachScrollToMock(container);

    rerender(
      <HookHarness
        events={[
          createMessage({role: Role.ASSISTANT, requestId: 1}),
          createMessage({role: Role.USER, requestId: 2}),
        ]}
      />
    );

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 800,
      behavior: 'smooth',
    });
  });

  it('shows the scroll-to-bottom button when a non-user message arrives off screen', async () => {
    const {rerender} = render(
      <HookHarness events={[createMessage({role: Role.USER, requestId: 1})]} />
    );

    const {container} = getHookElements();
    setContainerHeights(container, {clientHeight: 200, scrollHeight: 1000});
    container.scrollTop = 0;

    rerender(
      <HookHarness
        events={[
          createMessage({role: Role.USER, requestId: 1}),
          createMessage({role: Role.ASSISTANT, requestId: 2}),
        ]}
      />
    );

    await waitFor(() => {
      expect(hookState.showScrollToBottom).toBe(true);
    });
  });

  it('updates the spacer height based on the last user message position', () => {
    const {rerender} = render(
      <HookHarness events={[createMessage({role: Role.USER, requestId: 1})]} />
    );

    const {container, anchor, spacer} = getHookElements();

    setContainerHeights(container, {clientHeight: 300, scrollHeight: 600});
    setOffsetTop(anchor, 100);
    setOffsetTop(spacer, 250);

    rerender(
      <HookHarness
        events={[
          createMessage({role: Role.USER, requestId: 1}),
          createMessage({role: Role.ASSISTANT, requestId: 2}),
        ]}
      />
    );

    // container height = container.clientHeight = 300
    // space below content = spacer.offsetTop - anchor.offsetTop = 250 - 100 = 150
    // padding = 20
    // spacerHeight = 300 - 150 - 20 = 130
    expect(spacer.style.height).toBe('130px');
  });

  it('updates showScrollToBottom on scroll events', async () => {
    render(<HookHarness events={[createMessage({requestId: 1})]} />);

    const {container} = getHookElements();
    setContainerHeights(container, {clientHeight: 200, scrollHeight: 1000});
    container.scrollTop = 0;

    fireEvent.scroll(container);

    await waitFor(() => {
      expect(hookState.showScrollToBottom).toBe(true);
    });
  });
});
