import {buildMessagesForModelHistory} from '@cdo/apps/aichat/helpers/buildMessagesForModelHistory';
import {
  ChatEvent,
  CompletedChatMessage,
  Notification,
  AI_TUTOR_VERSION_ACTION_ACCEPT,
  AI_TUTOR_VERSION_ACTION_REJECT,
} from '@cdo/apps/aichat/types';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

const makeCompletedMessage = (
  overrides: Partial<CompletedChatMessage> = {}
): CompletedChatMessage => ({
  role: Role.USER,
  status: AiInteractionStatus.OK,
  chatMessageText: 'Hello',
  timestamp: 1000,
  requestId: 42,
  ...overrides,
});

const makeNotification = (
  notificationType: Notification['notificationType'],
  overrides: Partial<Notification> = {}
): Notification => ({
  removeId: 1,
  text: 'notification text',
  notificationType,
  timestamp: 2000,
  ...overrides,
});

describe('buildMessagesForModelHistory', () => {
  it('returns an empty array for empty input', () => {
    expect(buildMessagesForModelHistory([])).toEqual([]);
  });

  it('passes through completed chat messages unchanged', () => {
    const msg = makeCompletedMessage({chatMessageText: 'hi', requestId: 1});
    expect(buildMessagesForModelHistory([msg])).toEqual([msg]);
  });

  it('passes through multiple completed chat messages in order', () => {
    const msg1 = makeCompletedMessage({chatMessageText: 'first', requestId: 1});
    const msg2 = makeCompletedMessage({
      role: Role.ASSISTANT,
      chatMessageText: 'second',
      requestId: 2,
    });
    expect(buildMessagesForModelHistory([msg1, msg2])).toEqual([msg1, msg2]);
  });

  it('ignores non-accept/reject notifications', () => {
    const events: ChatEvent[] = [
      makeNotification('error'),
      makeNotification('success'),
      makeNotification('permissionsError'),
    ];
    expect(buildMessagesForModelHistory(events)).toEqual([]);
  });

  it('ignores model updates and user action events', () => {
    const events: ChatEvent[] = [
      {
        timestamp: 1000,
        removeId: 1,
        updatedField: 'temperature',
        updatedValue: 0.5,
      },
      {timestamp: 1000, descriptionKey: 'CLEAR_CHAT'},
    ];
    expect(buildMessagesForModelHistory(events)).toEqual([]);
  });

  describe('accept notification', () => {
    it('produces a single user message saying changes were accepted', () => {
      const notification = makeNotification(AI_TUTOR_VERSION_ACTION_ACCEPT, {
        timestamp: 5000,
      });
      const result = buildMessagesForModelHistory([notification]);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        role: Role.USER,
        status: AiInteractionStatus.OK,
        chatMessageText: expect.stringContaining('accepted'),
        timestamp: 5000,
        requestId: -1,
      });
    });

    it('includes file names in the accept message when files are provided', () => {
      const notification = makeNotification(AI_TUTOR_VERSION_ACTION_ACCEPT, {
        files: [
          {id: '1', name: 'index.html', contents: '', folderId: ''},
          {id: '2', name: 'style.css', contents: '', folderId: ''},
        ],
      });
      const result = buildMessagesForModelHistory([notification]);

      expect(result[0].chatMessageText).toContain('index.html');
      expect(result[0].chatMessageText).toContain('style.css');
    });
  });

  describe('reject notification', () => {
    it('produces two messages: a user rejection and an assistant acknowledgement', () => {
      const notification = makeNotification(AI_TUTOR_VERSION_ACTION_REJECT, {
        timestamp: 7000,
      });
      const result = buildMessagesForModelHistory([notification]);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        role: Role.USER,
        status: AiInteractionStatus.OK,
        chatMessageText: expect.stringContaining('rejected'),
        timestamp: 7000,
        requestId: -1,
      });
      expect(result[1]).toMatchObject({
        role: Role.ASSISTANT,
        status: AiInteractionStatus.OK,
        chatMessageText: expect.stringContaining('Understood'),
        timestamp: 7000,
        requestId: -1,
      });
    });

    it('includes file names in the reject message when files are provided', () => {
      const notification = makeNotification(AI_TUTOR_VERSION_ACTION_REJECT, {
        files: [{id: '1', name: 'app.js', contents: '', folderId: ''}],
      });
      const result = buildMessagesForModelHistory([notification]);

      expect(result[0].chatMessageText).toContain('app.js');
    });
  });

  describe('mixed event sequences', () => {
    it('interleaves real messages with accept/reject fake messages correctly', () => {
      const userMsg = makeCompletedMessage({
        role: Role.USER,
        chatMessageText: 'Can you update my code?',
        requestId: 10,
        timestamp: 1000,
      });
      const assistantMsg = makeCompletedMessage({
        role: Role.ASSISTANT,
        chatMessageText: 'Sure, here are the changes.',
        requestId: 11,
        timestamp: 2000,
      });
      const acceptNotification = makeNotification(
        AI_TUTOR_VERSION_ACTION_ACCEPT,
        {timestamp: 3000}
      );
      const followUp = makeCompletedMessage({
        role: Role.USER,
        chatMessageText: 'Thanks!',
        requestId: 12,
        timestamp: 4000,
      });

      const result = buildMessagesForModelHistory([
        userMsg,
        assistantMsg,
        acceptNotification,
        followUp,
      ]);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(userMsg);
      expect(result[1]).toEqual(assistantMsg);
      expect(result[2]).toMatchObject({role: Role.USER, requestId: -1});
      expect(result[3]).toEqual(followUp);
    });

    it('handles reject followed by another message', () => {
      const rejectNotification = makeNotification(
        AI_TUTOR_VERSION_ACTION_REJECT,
        {timestamp: 1000}
      );
      const nextUserMsg = makeCompletedMessage({
        role: Role.USER,
        chatMessageText: 'Try again differently.',
        requestId: 20,
        timestamp: 2000,
      });

      const result = buildMessagesForModelHistory([
        rejectNotification,
        nextUserMsg,
      ]);

      // reject yields 2 fake messages + 1 real message = 3 total
      expect(result).toHaveLength(3);
      expect(result[0].role).toBe(Role.USER);
      expect(result[0].requestId).toBe(-1);
      expect(result[1].role).toBe(Role.ASSISTANT);
      expect(result[1].requestId).toBe(-1);
      expect(result[2]).toEqual(nextUserMsg);
    });
  });
});
