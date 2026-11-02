import {acceptedBuilds} from '@cdo/apps/aichat/host/acceptedBuilds';
import {
  AI_TUTOR_VERSION_ACTION_ACCEPT,
  AI_TUTOR_VERSION_ACTION_REJECT,
  ChatEvent,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {ProjectFile} from '@cdo/apps/lab2/types';

const message = (role: Role, text: string, timestamp: number): ChatEvent => ({
  role,
  chatMessageText: text,
  status: 'ok',
  timestamp,
  requestId: timestamp,
});

const file = (name: string): ProjectFile => ({
  id: name,
  name,
  contents: `<p>${name}</p>`,
  folderId: '0',
});

const accepted = (timestamp: number, files: ProjectFile[]): ChatEvent => ({
  timestamp,
  removeId: timestamp,
  text: "You accepted AI Tutor's changes.",
  notificationType: AI_TUTOR_VERSION_ACTION_ACCEPT,
  files,
});

const rejected = (timestamp: number): ChatEvent => ({
  timestamp,
  removeId: timestamp,
  text: "You rejected AI Tutor's changes.",
  notificationType: AI_TUTOR_VERSION_ACTION_REJECT,
});

describe('acceptedBuilds', () => {
  it('pairs each accepted build with the files it changed and the exchange before it', () => {
    const events = [
      message(Role.USER, 'Add a heading', 1),
      message(Role.ASSISTANT, 'Here is a heading.', 2),
      accepted(3, [file('index.html')]),
      message(Role.USER, 'Make it blue', 4),
      rejected(5),
      message(Role.USER, 'Make it green', 6),
      accepted(7, [file('style.css')]),
    ];
    expect(acceptedBuilds(events)).toEqual([
      {
        at: 3,
        files: [file('index.html')],
        transcript: 'Student: Add a heading\nTutor: Here is a heading.',
      },
      {
        at: 7,
        files: [file('style.css')],
        transcript: 'Student: Make it blue\nStudent: Make it green',
      },
    ]);
  });

  it('reads the display text when a message has one, and finds no build in an exchange with none', () => {
    const shown: ChatEvent = {
      ...message(Role.USER, 'sent text', 1),
      chatMessageDisplayText: 'shown text',
    };
    expect(acceptedBuilds([shown, accepted(2, [])])).toEqual([
      {at: 2, files: [], transcript: 'Student: shown text'},
    ]);
    expect(acceptedBuilds([shown, rejected(2)])).toEqual([]);
  });
});
