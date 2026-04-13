import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import {AichatState} from '@cdo/apps/aichat/redux';
import {
  CompletedChatMessage,
  UserActionEvent,
  WorkspaceTeacherViewTab,
} from '@cdo/apps/aichat/types';
import CopyChatHistoryButton from '@cdo/apps/aichat/views/aiChatHeaderButtons/CopyChatHistoryButton';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

// Intercept clipboard writes so tests can assert on the copied text.
jest.mock('@cdo/apps/util/copyToClipboard');

const mockDispatch = jest.fn();

// mockState is mutated per-test to simulate different redux store shapes.
let mockState: {aichat: Partial<AichatState>};

// Route all useAppSelector calls through mockState instead of a real store.
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (selector: (s: unknown) => unknown) => selector(mockState),
  useAppDispatch: () => mockDispatch,
}));

const userMessage: CompletedChatMessage = {
  role: Role.USER,
  chatMessageText: 'Hello from user',
  status: AiInteractionStatus.OK,
  timestamp: 1000000,
  requestId: 1,
};

const botMessage: CompletedChatMessage = {
  role: Role.ASSISTANT,
  chatMessageText: 'Hello from bot',
  status: AiInteractionStatus.OK,
  timestamp: 2000000,
  requestId: 2,
};

const studentHistoryMessage: CompletedChatMessage & {id: number} = {
  role: Role.USER,
  chatMessageText: 'Student message',
  status: AiInteractionStatus.OK,
  timestamp: 3000000,
  requestId: 3,
  id: 100,
};

const clearChatEvent: UserActionEvent & {id: number} = {
  descriptionKey: 'CLEAR_CHAT',
  timestamp: 4000000,
  id: 101,
};

describe('CopyChatHistoryButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      aichat: {
        chatEventsPast: [],
        chatEventsCurrent: [],
        studentChatHistory: [],
        chatWorkspaceSelectedTab: null,
      },
    };
  });

  // When not viewing a student, the button copies the teacher's own chat events.
  it('copies own visible messages when not viewing a student', () => {
    mockState.aichat.chatEventsPast = [userMessage];
    mockState.aichat.chatEventsCurrent = [botMessage];
    mockState.aichat.chatWorkspaceSelectedTab = null;

    render(<CopyChatHistoryButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(copyToClipboard).toHaveBeenCalledTimes(1);
    const copied = (copyToClipboard as jest.Mock).mock.calls[0][0] as string;
    expect(copied).toContain('Hello from user');
    expect(copied).toContain('Hello from bot');
    expect(copied).not.toContain('Student message');
  });

  // When a teacher is viewing a student's chat in read only, copy those
  // messages, not the teacher's own.
  it('copies student chat history when on the student history tab', () => {
    mockState.aichat.chatEventsPast = [userMessage];
    mockState.aichat.chatEventsCurrent = [botMessage];
    mockState.aichat.studentChatHistory = [studentHistoryMessage];
    mockState.aichat.chatWorkspaceSelectedTab =
      WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY;

    render(<CopyChatHistoryButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(copyToClipboard).toHaveBeenCalledTimes(1);
    const copied = (copyToClipboard as jest.Mock).mock.calls[0][0] as string;
    expect(copied).toContain('Student message');
    expect(copied).not.toContain('Hello from user');
    expect(copied).not.toContain('Hello from bot');
  });

  // When a teacher is "viewing as" student a la teacher panel,
  // copy the teacher's own messages.
  it('copies own messages when teacher is viewing as student', () => {
    mockState.aichat.chatEventsPast = [userMessage];
    mockState.aichat.studentChatHistory = [studentHistoryMessage];
    mockState.aichat.chatWorkspaceSelectedTab =
      WorkspaceTeacherViewTab.TEST_STUDENT_MODEL;

    render(<CopyChatHistoryButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(copyToClipboard).toHaveBeenCalledTimes(1);
    const copied = (copyToClipboard as jest.Mock).mock.calls[0][0] as string;
    expect(copied).toContain('Hello from user');
    expect(copied).not.toContain('Student message');
  });

  // UserActionEvents (e.g. CLEAR_CHAT) appear in teacher-facing student history
  // and must be included in the copied text.
  it('includes UserActionEvents when copying student chat history', () => {
    mockState.aichat.studentChatHistory = [
      studentHistoryMessage,
      clearChatEvent,
    ];
    mockState.aichat.chatWorkspaceSelectedTab =
      WorkspaceTeacherViewTab.STUDENT_CHAT_HISTORY;

    render(<CopyChatHistoryButton />);
    fireEvent.click(screen.getByRole('button'));

    const copied = (copyToClipboard as jest.Mock).mock.calls[0][0] as string;
    expect(copied).toContain('Student message');
    expect(copied).toContain('The user cleared the chat workspace.');
  });

  // Copies an empty string rather than erroring with an empty chat.
  it('copies an empty string when there are no messages', () => {
    render(<CopyChatHistoryButton />);
    fireEvent.click(screen.getByRole('button'));

    expect(copyToClipboard).toHaveBeenCalledTimes(1);
    const copied = (copyToClipboard as jest.Mock).mock.calls[0][0] as string;
    expect(copied).toBe('');
  });
});
