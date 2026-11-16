import {renderHook} from '@testing-library/react-hooks';

import {UNLOCK_MESSAGES} from '@cdo/apps/adaptive/ai/validation/unlockMessages';
import {sendContinueUnlocked} from '@cdo/apps/adaptive/metricsHelpers';
import {ValidationAttempt} from '@cdo/apps/adaptive/progress/model';
import {LevelStep} from '@cdo/apps/adaptive/types';
import {
  ChatUnlockOptions,
  useChatUnlock,
} from '@cdo/apps/adaptive/views/steps/useChatUnlock';
import {
  ChatHandle,
  ChatTranscript,
} from '@cdo/apps/aichat/host/ChatHostContext';

jest.mock('@cdo/apps/adaptive/ai/validation/chatThresholds', () => ({
  chatThresholds: () => ({replyLimit: 8}),
}));
jest.mock('@cdo/apps/adaptive/metricsHelpers', () => ({
  ...jest.requireActual('@cdo/apps/adaptive/metricsHelpers'),
  sendContinueUnlocked: jest.fn(),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({getState: () => ({lab2Project: {projectSources: {}}})}),
}));
const mockSendUnlocked = sendContinueUnlocked as jest.Mock;

const step = {
  id: 'build',
  title: 'Build',
  kind: 'level',
  level: 'x',
  project: true,
  validation: {condition: 'Has a heading.', measures: {skillId: 'build'}},
  levelProperties: {id: 1, appName: 'weblab2'},
} as unknown as LevelStep;
const checkpoint = {id: 'c'} as never;
const reply = (count: number): ChatTranscript => ({
  at: count,
  replies: count,
  text: `Student: ${count}`,
});
const limit: Omit<ValidationAttempt, 'at'> = {
  source: 'limit',
  pass: true,
  evidenceLevel: 0,
  reason: UNLOCK_MESSAGES.limit,
  replies: 8,
};
const work: ValidationAttempt = {
  at: 'now',
  pass: false,
  evidenceLevel: 1,
  reason: 'Not quite!',
};

/** A chat that remembers its reply listeners and what was posted. */
const fakeChat = () => {
  const listeners: ((transcript: ChatTranscript) => void)[] = [];
  const chat: ChatHandle = {
    post: jest.fn(() => jest.fn()),
    onBuildAccepted: jest.fn(() => () => {}),
    onReply: jest.fn(listener => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    }),
    disableSend: jest.fn(),
    enableSend: jest.fn(),
  };
  return {chat, listeners};
};

const render = (
  chat: ChatHandle | undefined,
  overrides: Partial<ChatUnlockOptions> = {}
) => {
  const options: ChatUnlockOptions = {
    checkpoint,
    step,
    chat,
    progress: undefined,
    continueAllowed: false,
    recordAttempt: jest.fn(),
    ...overrides,
  };
  const hook = renderHook((props: Partial<ChatUnlockOptions>) =>
    useChatUnlock({...options, ...props})
  );
  return {...hook, options};
};

describe('useChatUnlock', () => {
  beforeEach(() => mockSendUnlocked.mockReset());

  it('does nothing before the limit', () => {
    const {chat, listeners} = fakeChat();
    const {options} = render(chat);
    listeners[0](reply(7));
    expect(options.recordAttempt).not.toHaveBeenCalled();
    expect(mockSendUnlocked).not.toHaveBeenCalled();
    expect(chat.post).not.toHaveBeenCalled();
  });

  it('opens Continue at the limit, records it, reports it and tells the student, once', () => {
    const {chat, listeners} = fakeChat();
    const {options, rerender} = render(chat, {
      progress: {timeSpent: 0, validationHistory: [work]},
    });

    listeners[0](reply(8));

    expect(options.recordAttempt).toHaveBeenCalledWith(limit);
    expect(mockSendUnlocked).toHaveBeenCalledWith(
      'replyLimit',
      checkpoint,
      step,
      {validationAttempts: 1, replies: 8}
    );
    expect(chat.post).toHaveBeenCalledWith({
      notificationType: 'info',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: UNLOCK_MESSAGES.limit,
    });

    // Still locked in the progress, say the save has not come back: not again.
    rerender({
      progress: {
        timeSpent: 0,
        validationHistory: [work, {...limit, at: 'now'}],
      },
    });
    listeners[0](reply(9));
    expect(options.recordAttempt).toHaveBeenCalledTimes(1);
    expect(mockSendUnlocked).toHaveBeenCalledTimes(1);
  });

  it('listens only while Continue is locked, with a chat, a validation block and a lab that reports its chat, and stops when unmounted', () => {
    const {chat, listeners} = fakeChat();
    render(undefined);
    render(chat, {continueAllowed: true});
    render(chat, {step: {...step, validation: undefined}});
    render(chat, {
      step: {
        ...step,
        levelProperties: {id: 1, appName: 'pythonlab'},
      } as unknown as LevelStep,
    });
    expect(listeners).toHaveLength(0);

    const {unmount, rerender} = render(chat);
    expect(listeners).toHaveLength(1);
    rerender({continueAllowed: true});
    expect(listeners).toHaveLength(0);
    rerender({continueAllowed: false});
    expect(listeners).toHaveLength(1);
    unmount();
    expect(listeners).toHaveLength(0);
  });
});
