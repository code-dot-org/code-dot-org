import {renderHook} from '@testing-library/react-hooks';

import {validateStep} from '@cdo/apps/adaptive/ai/validation/validateStep';
import {LevelStep} from '@cdo/apps/adaptive/types';
import {useStepValidation} from '@cdo/apps/adaptive/views/steps/useStepValidation';
import {AcceptedBuild, ChatHandle} from '@cdo/apps/aichat/host/ChatHostContext';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/validation/validateStep', () => ({
  validateStep: jest.fn(),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: () => ({
    getState: () => ({
      lab2Project: {projectSources: {source: '<h1>Bakery</h1>'}},
    }),
  }),
}));
const mockValidateStep = validateStep as jest.Mock;

const step = {
  id: 'build',
  title: 'Build',
  kind: 'level',
  level: 'x',
  project: true,
  validation: {condition: 'Has a heading.', measures: {skillId: 'build'}},
  levelProperties: {id: 1, appName: 'weblab2'},
} as unknown as LevelStep;
const build: AcceptedBuild = {
  at: 5,
  files: [{id: 'a', name: 'a.html', contents: '<p/>', folderId: '0'}],
  transcript: 'Student: hi',
};
const work = {
  at: 5,
  change: expect.stringContaining('filename: a.html'),
  process: 'Student: hi',
  project: '<h1>Bakery</h1>',
};

/** A chat that remembers its listeners and what was posted. */
const fakeChat = () => {
  const listeners: ((build: AcceptedBuild) => void)[] = [];
  const dismiss = jest.fn();
  const chat: ChatHandle = {
    post: jest.fn(() => dismiss),
    onBuildAccepted: jest.fn(listener => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    }),
    disableSend: jest.fn(),
    enableSend: jest.fn(),
  };
  return {chat, listeners, dismiss};
};

/** A judge that says it is running, then answers. */
const judge = (attempt: unknown) => (options: {onJudging?: () => void}) => {
  options.onJudging?.();
  return Promise.resolve(attempt);
};

const baseOptions = (chat: ChatHandle | undefined) => ({
  pathway: {skills: {}, checkpoints: []} as never,
  checkpoint: {id: 'c'} as never,
  step,
  projectInfo: {name: 'Bakery', description: ''},
  instructions: undefined,
  aichatContext: {
    clientType: AiChatClientTypes.ADAPTIVE,
    currentLevelId: 1,
    scriptId: 2,
    channelId: undefined,
  },
  chat,
  recordValidation: jest.fn(),
});

const render = (
  chat: ChatHandle | undefined,
  stepOverrides: Partial<LevelStep> = {}
) => {
  const options = baseOptions(chat);
  const hook = renderHook(() =>
    useStepValidation({...options, step: {...step, ...stepOverrides}})
  );
  return {...hook, recordValidation: options.recordValidation};
};

describe('useStepValidation', () => {
  beforeEach(() => mockValidateStep.mockReset());

  it("judges each piece of the lab's work, records the verdict and has the lab say a check is running, then the verdict", async () => {
    const attempt = {
      pass: true,
      evidenceLevel: 2,
      reason: 'Success! Nice heading.',
    };
    mockValidateStep.mockImplementation(judge(attempt));
    const {chat, listeners, dismiss} = fakeChat();
    const {recordValidation, waitFor} = render(chat);

    listeners[0](build);
    await waitFor(() => expect(recordValidation).toHaveBeenCalledWith(attempt));

    expect(mockValidateStep).toHaveBeenCalledWith(
      expect.objectContaining({work})
    );
    expect(chat.post).toHaveBeenNthCalledWith(1, {
      notificationType: 'info',
      includeInChatHistory: false,
      hideTimestamp: true,
      text: 'Checking your work...',
    });
    expect(chat.disableSend).toHaveBeenCalledTimes(1);
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(chat.enableSend).toHaveBeenCalledTimes(1);
    expect(chat.post).toHaveBeenNthCalledWith(2, {
      notificationType: 'success',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: 'Success! Nice heading.',
    });
  });

  it('warns when the work does not pass, and takes back the running notice without a verdict', async () => {
    mockValidateStep.mockImplementationOnce(
      judge({
        pass: false,
        evidenceLevel: 1,
        reason: 'Not quite! Add a heading.',
      })
    );
    mockValidateStep.mockImplementationOnce(judge(undefined));
    const {chat, listeners, dismiss} = fakeChat();
    const {recordValidation, waitFor} = render(chat);

    listeners[0](build);
    await waitFor(() => expect(chat.post).toHaveBeenCalledTimes(2));
    expect(chat.post).toHaveBeenLastCalledWith({
      notificationType: 'warning',
      includeInChatHistory: true,
      hideTimestamp: true,
      text: 'Not quite! Add a heading.',
    });

    listeners[0]({...build, at: 6});
    await waitFor(() => expect(dismiss).toHaveBeenCalledTimes(2));
    expect(recordValidation).toHaveBeenCalledTimes(1);
    expect(chat.post).toHaveBeenCalledTimes(3);
  });

  it('says nothing when the judge never runs', async () => {
    mockValidateStep.mockResolvedValue(undefined);
    const {chat, listeners, dismiss} = fakeChat();
    const {waitFor} = render(chat);

    listeners[0](build);
    await waitFor(() => expect(mockValidateStep).toHaveBeenCalledTimes(1));
    expect(chat.post).not.toHaveBeenCalled();
    expect(chat.disableSend).not.toHaveBeenCalled();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('listens only with a chat, a validation block and a lab that reports work, and stops when unmounted', () => {
    const {chat, listeners} = fakeChat();
    render(undefined);
    render(chat, {validation: undefined});
    render(chat, {
      levelProperties: {
        id: 1,
        appName: 'pythonlab',
      } as LevelStep['levelProperties'],
    });
    expect(listeners).toHaveLength(0);

    const {unmount} = render(chat);
    expect(listeners).toHaveLength(1);
    unmount();
    expect(listeners).toHaveLength(0);
  });
});
