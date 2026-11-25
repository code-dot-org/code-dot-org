import {renderHook} from '@testing-library/react-hooks';

import {judgeEffort} from '@cdo/apps/adaptive/ai/validation/judgeEffort';
import {UNLOCK_MESSAGES} from '@cdo/apps/adaptive/ai/validation/unlockMessages';
import {
  sendAdaptiveEvent,
  sendContinueUnlocked,
} from '@cdo/apps/adaptive/metricsHelpers';
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
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/validation/chatThresholds', () => ({
  chatThresholds: () => ({effortCheckAt: 4, replyLimit: 8}),
}));
jest.mock('@cdo/apps/adaptive/ai/validation/judgeEffort', () => ({
  judgeEffort: jest.fn(),
}));
jest.mock('@cdo/apps/adaptive/metricsHelpers', () => ({
  ...jest.requireActual('@cdo/apps/adaptive/metricsHelpers'),
  sendAdaptiveEvent: jest.fn(),
  sendContinueUnlocked: jest.fn(),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({getState: () => ({lab2Project: {projectSources: {}}})}),
}));
let mockIsReadonly = false;
jest.mock('@cdo/apps/adaptive/views/PathwayContext', () => ({
  usePathwayContext: () => ({isReadonly: mockIsReadonly}),
}));
const mockJudgeEffort = judgeEffort as jest.Mock;
const mockSendEvent = sendAdaptiveEvent as jest.Mock;
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
const effort = (replies = 4): Omit<ValidationAttempt, 'at'> => ({
  pass: true,
  evidenceLevel: 0,
  reason: UNLOCK_MESSAGES.effortDemonstrated,
  skipReason: 'effortDemonstrated',
  replies,
  traceId: 't',
});
const limit: Omit<ValidationAttempt, 'at'> = {
  pass: true,
  evidenceLevel: 0,
  reason: UNLOCK_MESSAGES.limitReached,
  skipReason: 'limitReached',
  replies: 8,
  traceId: undefined,
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
    pathway: {skills: {}, checkpoints: []} as never,
    checkpoint,
    step,
    instructions: 'Add a heading.',
    aichatContext: {
      clientType: AiChatClientTypes.ADAPTIVE,
      currentLevelId: 1,
      scriptId: 2,
      channelId: undefined,
    },
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
  beforeEach(() => {
    mockJudgeEffort.mockReset();
    mockSendEvent.mockReset();
    mockIsReadonly = false;
    mockSendUnlocked.mockReset();
  });

  it('does nothing before the first threshold', () => {
    const {chat, listeners} = fakeChat();
    const {options} = render(chat);
    listeners[0](reply(3));
    expect(mockJudgeEffort).not.toHaveBeenCalled();
    expect(options.recordAttempt).not.toHaveBeenCalled();
    expect(chat.post).not.toHaveBeenCalled();
  });

  it('judges the chat at the first threshold and opens Continue when the effort is real', async () => {
    mockJudgeEffort.mockResolvedValue({pass: true, traceId: 't'});
    const {chat, listeners} = fakeChat();
    const {options, waitFor} = render(chat, {
      progress: {timeSpent: 0, validationHistory: [work]},
    });

    listeners[0](reply(4));
    await waitFor(() =>
      expect(options.recordAttempt).toHaveBeenCalledWith(effort())
    );

    expect(mockJudgeEffort).toHaveBeenCalledWith(
      expect.objectContaining({
        step,
        instructions: 'Add a heading.',
        transcript: 'Student: 4',
        replies: 4,
      })
    );
    expect(mockSendEvent).toHaveBeenCalledWith(
      'Adaptive Effort Check Passed',
      expect.objectContaining({
        stepId: 'build',
        replies: 4,
        validationAttempts: 1,
        latencyMs: expect.any(Number),
      })
    );
    expect(mockSendUnlocked).toHaveBeenCalledWith(
      'effortDemonstrated',
      checkpoint,
      step,
      {validationAttempts: 1, replies: 4}
    );
    expect(chat.post).toHaveBeenCalledWith(
      expect.objectContaining({
        notificationType: 'info',
        text: UNLOCK_MESSAGES.effortDemonstrated,
      })
    );
  });

  it('records nothing on a no, reports it, and judges again at the next reply', async () => {
    mockJudgeEffort.mockResolvedValue({pass: false, traceId: 't'});
    const {chat, listeners} = fakeChat();
    const {options, waitFor} = render(chat);

    listeners[0](reply(4));
    await waitFor(() =>
      expect(mockSendEvent).toHaveBeenCalledWith(
        'Adaptive Effort Check Failed',
        expect.objectContaining({replies: 4, validationAttempts: 0})
      )
    );
    expect(options.recordAttempt).not.toHaveBeenCalled();
    expect(mockSendUnlocked).not.toHaveBeenCalled();
    expect(chat.post).not.toHaveBeenCalled();

    listeners[0](reply(5));
    await waitFor(() => expect(mockJudgeEffort).toHaveBeenCalledTimes(2));
    expect(mockJudgeEffort).toHaveBeenLastCalledWith(
      expect.objectContaining({replies: 5})
    );
  });

  it('judges again at the next reply when the judge gave no answer, and not while one is running', async () => {
    let answer: (judgement: unknown) => void = () => {};
    mockJudgeEffort.mockImplementationOnce(
      () => new Promise(resolve => (answer = resolve))
    );
    mockJudgeEffort.mockResolvedValueOnce({pass: true, traceId: 't'});
    const {chat, listeners} = fakeChat();
    const {options, waitFor} = render(chat);

    listeners[0](reply(4));
    listeners[0](reply(5));
    expect(mockJudgeEffort).toHaveBeenCalledTimes(1);
    answer(undefined);
    await waitFor(() => expect(mockJudgeEffort).toHaveBeenCalledTimes(1));
    expect(options.recordAttempt).not.toHaveBeenCalled();

    listeners[0](reply(6));
    await waitFor(() =>
      expect(options.recordAttempt).toHaveBeenCalledWith(effort(6))
    );
  });

  it('reports a judge that finishes after Continue opened or the step was left, but opens nothing', async () => {
    let answer: (judgement: unknown) => void = () => {};
    mockJudgeEffort.mockImplementationOnce(
      () => new Promise(resolve => (answer = resolve))
    );
    const {chat, listeners} = fakeChat();
    const {options, rerender, waitFor} = render(chat);

    listeners[0](reply(4));
    rerender({continueAllowed: true});
    expect(listeners).toHaveLength(0);
    answer({pass: true, traceId: 't'});
    await waitFor(() =>
      expect(mockSendEvent).toHaveBeenCalledWith(
        'Adaptive Effort Check Passed',
        expect.objectContaining({replies: 4})
      )
    );

    expect(options.recordAttempt).not.toHaveBeenCalled();
    expect(mockSendUnlocked).not.toHaveBeenCalled();
    expect(chat.post).not.toHaveBeenCalled();
  });

  it('runs one judge at a time even after the chat hands back a new handle', async () => {
    let answer: (judgement: unknown) => void = () => {};
    mockJudgeEffort.mockImplementationOnce(
      () => new Promise(resolve => (answer = resolve))
    );
    mockJudgeEffort.mockResolvedValueOnce({pass: true, traceId: 't'});
    const first = fakeChat();
    const second = fakeChat();
    const {options, rerender, waitFor} = render(first.chat);

    first.listeners[0](reply(4));
    rerender({chat: second.chat});
    expect(first.listeners).toHaveLength(0);
    second.listeners[0](reply(5));
    expect(mockJudgeEffort).toHaveBeenCalledTimes(1);

    answer({pass: true, traceId: 't'});
    await waitFor(() => expect(mockSendEvent).toHaveBeenCalledTimes(1));
    expect(options.recordAttempt).not.toHaveBeenCalled();

    second.listeners[0](reply(6));
    await waitFor(() =>
      expect(options.recordAttempt).toHaveBeenCalledWith(effort(6))
    );
    expect(mockJudgeEffort).toHaveBeenCalledTimes(2);
    expect(second.chat.post).toHaveBeenCalledTimes(1);
    expect(first.chat.post).not.toHaveBeenCalled();
  });

  it('opens Continue at the limit regardless, once, without a judge', () => {
    const {chat, listeners} = fakeChat();
    const {options, rerender} = render(chat, {
      progress: {timeSpent: 0, validationHistory: [work]},
    });

    listeners[0](reply(8));

    expect(mockJudgeEffort).not.toHaveBeenCalled();
    expect(options.recordAttempt).toHaveBeenCalledWith(limit);
    expect(mockSendUnlocked).toHaveBeenCalledWith(
      'limitReached',
      checkpoint,
      step,
      {validationAttempts: 1, replies: 8}
    );
    expect(chat.post).toHaveBeenCalledWith({
      notificationType: 'info',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: UNLOCK_MESSAGES.limitReached,
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

  it('does not listen while a teacher views a student', () => {
    const {chat, listeners} = fakeChat();
    mockIsReadonly = true;
    render(chat);

    expect(listeners).toHaveLength(0);
  });
});
