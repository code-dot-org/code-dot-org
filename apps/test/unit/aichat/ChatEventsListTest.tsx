import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import {CompletedChatMessage} from '@cdo/apps/aichat/types';
import ChatEventsList from '@cdo/apps/aichat/views/ChatEventsList';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {commonI18n} from '@cdo/apps/types/locale';
import {
  AiChatTeacherFeedback,
  AiInteractionStatus,
} from '@cdo/generated-scripts/sharedConstants';

const TEACHER_FLAGGED_PLACEHOLDER =
  'This message has been flagged by your teacher.';

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
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: () => mockPending,
  useAppDispatch: () => () => {},
}));

describe('ChatEventsList', () => {
  it('renders general disabled state message when disabled', () => {
    render(<ChatEventsList events={[]} disabledState={{disabled: true}} />);

    expect(
      screen.getByText('AI chat is currently disabled')
    ).toBeInTheDocument();

    // No chat messages or waiting animation should render
    expect(screen.queryByLabelText(commonI18n.aiChatMessageUser())).toBeNull();
    expect(screen.queryByLabelText(commonI18n.aiChatMessageBot())).toBeNull();
    expect(screen.queryByText(mockWaitingText)).not.toBeInTheDocument();
  });

  it('renders a custom disabled state message when provided', () => {
    const customMessage = 'Ai chat is disabled for this student';
    render(
      <ChatEventsList
        events={[]}
        disabledState={{
          disabled: true,
          disabledMessage: customMessage,
        }}
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(
      screen.queryByText('AI chat is currently disabled')
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

// ServerChatEvent requires an `id` field in addition to CompletedChatMessage fields.
type FlaggedMessage = CompletedChatMessage & {id: number};

describe('ChatEventsList — teacher-flagged messages', () => {
  const flaggedUserMessage: FlaggedMessage = {
    id: 1,
    timestamp: Date.now() - 2000,
    chatMessageText: 'Inappropriate user message',
    role: Role.USER,
    status: AiInteractionStatus.OK,
    requestId: 1,
    teacherFeedback: AiChatTeacherFeedback.CLEAN_DISAGREE,
  };

  const flaggedAssistantMessage: FlaggedMessage = {
    id: 2,
    timestamp: Date.now() - 1000,
    chatMessageText: 'Inappropriate assistant response',
    role: Role.ASSISTANT,
    status: AiInteractionStatus.OK,
    requestId: 2,
    teacherFeedback: AiChatTeacherFeedback.CLEAN_DISAGREE,
  };

  it('student view: shows placeholder instead of original text for flagged messages', () => {
    render(
      <ChatEventsList events={[flaggedUserMessage, flaggedAssistantMessage]} />
    );

    // Placeholder shown for each flagged message
    expect(screen.getAllByText(TEACHER_FLAGGED_PLACEHOLDER)).toHaveLength(2);

    // Original text not visible to student
    expect(
      screen.queryByText(flaggedUserMessage.chatMessageText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(flaggedAssistantMessage.chatMessageText)
    ).not.toBeInTheDocument();
  });

  it('teacher view: shows original text and feedback footer for flagged messages', () => {
    render(
      <ChatEventsList
        events={[flaggedUserMessage, flaggedAssistantMessage]}
        isTeacherView
      />
    );

    // Original text visible to teacher
    expect(
      screen.getByText(flaggedUserMessage.chatMessageText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(flaggedAssistantMessage.chatMessageText)
    ).toBeInTheDocument();

    // Placeholder not shown in teacher view
    expect(
      screen.queryByText(TEACHER_FLAGGED_PLACEHOLDER)
    ).not.toBeInTheDocument();

    // Feedback footer present: flag button rendered in active "unflag" state for each message
    expect(screen.getAllByRole('button', {name: 'unflag'})).toHaveLength(2);
  });
});
