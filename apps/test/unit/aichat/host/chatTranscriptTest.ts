import {chatTranscript} from '@cdo/apps/aichat/host/chatTranscript';
import {
  AI_TUTOR_VERSION_ACTION_ACCEPT,
  ChatEvent,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

const message = (
  role: Role,
  text: string,
  timestamp: number,
  status = 'ok'
): ChatEvent =>
  ({
    role,
    chatMessageText: text,
    status,
    timestamp,
    requestId: timestamp,
  } as ChatEvent);

describe('chatTranscript', () => {
  it('counts every finished reply and carries the whole conversation up to the newest', () => {
    const events: ChatEvent[] = [
      message(Role.USER, 'Add a heading', 1),
      message(Role.ASSISTANT, 'Here is a heading.', 2),
      {
        timestamp: 3,
        removeId: 3,
        text: 'accepted',
        notificationType: AI_TUTOR_VERSION_ACTION_ACCEPT,
      },
      message(Role.USER, 'Make it blue', 4),
      message(Role.ASSISTANT, 'Done.', 5),
    ];
    expect(chatTranscript(events)).toEqual({
      at: 5,
      replies: 2,
      text: 'Student: Add a heading\nTutor: Here is a heading.\nStudent: Make it blue\nTutor: Done.',
    });
  });

  it('is undefined until a reply finishes, and skips pending or failed replies', () => {
    expect(chatTranscript([])).toBeUndefined();
    expect(chatTranscript([message(Role.USER, 'Hi', 1)])).toBeUndefined();
    const events: ChatEvent[] = [
      message(Role.USER, 'Hi', 1),
      message(Role.ASSISTANT, 'Hello.', 2),
      message(Role.USER, 'Hello?', 3),
      message(Role.ASSISTANT, '', 4, 'unknown'),
      message(Role.ASSISTANT, 'Sorry', 5, 'error'),
    ];
    expect(chatTranscript(events)).toEqual({
      at: 2,
      replies: 1,
      text: 'Student: Hi\nTutor: Hello.\nStudent: Hello?\nTutor: \nTutor: Sorry',
    });
  });

  it('prefers the display text of a message', () => {
    const events: ChatEvent[] = [
      message(Role.USER, 'Add a heading', 1),
      {
        ...message(Role.ASSISTANT, '{"build": true}', 2),
        chatMessageDisplayText: 'Building a heading.',
      } as ChatEvent,
    ];
    expect(chatTranscript(events)?.text).toBe(
      'Student: Add a heading\nTutor: Building a heading.'
    );
  });
});
