import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import {AiChatDisabledProvider} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import aichatI18n from '@cdo/apps/aichat/locale';
import {CompletedChatMessage} from '@cdo/apps/aichat/types';
import ChatEventsList from '@cdo/apps/aichat/views/ChatEventsList';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

const mockWaitingText = 'Waiting...';

// Mock WaitingAnimation to render visible, queryable text
jest.mock('@cdo/apps/aichat/views/WaitingAnimation', () => {
  const React = require('react');
  const Waiting = ({shouldDisplay}: {shouldDisplay: boolean}) =>
    shouldDisplay ? React.createElement('div', null, mockWaitingText) : null;
  return {__esModule: true, default: Waiting, WaitingAnimation: Waiting};
});

// Mock redux hooks to avoid real store; only selector value matters here
let mockPending = false;
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  __esModule: true,
  useAppSelector: () => mockPending,
  useAppDispatch: () => () => {},
}));

describe('ChatEventsList', () => {
  it('renders general disabled state message when disabled', () => {
    render(
      <AiChatDisabledProvider chatDisabled>
        <ChatEventsList events={[]} />
      </AiChatDisabledProvider>
    );

    expect(screen.getByText(aichatI18n.aiChatDisabled())).toBeInTheDocument();

    // No chat messages or waiting animation should render
    expect(screen.queryByLabelText(commonI18n.aiChatMessageUser())).toBeNull();
    expect(screen.queryByLabelText(commonI18n.aiChatMessageBot())).toBeNull();
    expect(screen.queryByText(mockWaitingText)).not.toBeInTheDocument();
  });

  it('renders a custom disabled state message when provided', () => {
    const customMessage = 'Ai chat is disabled for this student';
    render(
      <AiChatDisabledProvider chatDisabled chatDisabledMessage={customMessage}>
        <ChatEventsList events={[]} />
      </AiChatDisabledProvider>
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(
      screen.queryByText(aichatI18n.aiChatDisabled())
    ).not.toBeInTheDocument();

    // No chat messages or waiting animation should render
    expect(screen.queryByLabelText(commonI18n.aiChatMessageUser())).toBeNull();
    expect(screen.queryByLabelText(commonI18n.aiChatMessageBot())).toBeNull();
    expect(screen.queryByText(mockWaitingText)).not.toBeInTheDocument();
  });

  it('renders chat events (user and ai assistant messages)', () => {
    const events: CompletedChatMessage[] = [
      {
        timestamp: Date.now() - 1000,
        chatMessageText: 'Hello there!',
        role: Role.USER,
        status: AiInteractionStatus.OK,
        requestId: 1,
      },
      {
        timestamp: Date.now(),
        chatMessageText: 'Hi! How can I help?',
        role: Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        requestId: 2,
      },
    ];

    render(<ChatEventsList events={events} />);

    // Messages render with aria-labels from common strings
    expect(
      screen.getByLabelText(commonI18n.aiChatMessageUser())
    ).toHaveTextContent('Hello there!');
    expect(
      screen.getByLabelText(commonI18n.aiChatMessageBot())
    ).toHaveTextContent('Hi! How can I help?');
  });

  it('shows waiting animation when a chat message is pending', async () => {
    const events: CompletedChatMessage[] = [
      {
        timestamp: Date.now() - 1000,
        chatMessageText: 'Question for the bot',
        role: Role.USER,
        status: AiInteractionStatus.OK,
        requestId: 100,
      },
    ];

    const {rerender} = render(<ChatEventsList events={events} />);

    // Initially, waiting animation should not be present
    expect(screen.queryByText(mockWaitingText)).not.toBeInTheDocument();

    // Simulate a pending message via mocked selector and re-render
    mockPending = true;
    rerender(<ChatEventsList events={events} />);

    await waitFor(() => {
      expect(screen.getByText(mockWaitingText)).toBeInTheDocument();
    });
  });
});
