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
  const chat: ChatHandle = {
    post: jest.fn(),
    onBuildAccepted: jest.fn(listener => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    }),
  };
  return {chat, listeners};
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

  it("judges each piece of the lab's work, records the verdict and has the lab tell the student", async () => {
    const attempt = {pass: true, evidenceLevel: 2, reason: 'Nice heading.'};
    mockValidateStep.mockResolvedValue(attempt);
    const {chat, listeners} = fakeChat();
    const {recordValidation, waitFor} = render(chat);

    listeners[0](build);
    await waitFor(() => expect(recordValidation).toHaveBeenCalledWith(attempt));

    expect(mockValidateStep).toHaveBeenCalledWith(
      expect.objectContaining({work})
    );
    expect(chat.post).toHaveBeenCalledWith({
      notificationType: 'hostMessage',
      includeInChatHistory: true,
      text: "This meets the step's goal. Nice heading.",
    });
  });

  it('says not there yet when the work does not pass, and nothing without a verdict', async () => {
    mockValidateStep.mockResolvedValueOnce({
      pass: false,
      evidenceLevel: 1,
      reason: 'Add a heading.',
    });
    mockValidateStep.mockResolvedValueOnce(undefined);
    const {chat, listeners} = fakeChat();
    const {recordValidation, waitFor} = render(chat);

    listeners[0](build);
    await waitFor(() => expect(chat.post).toHaveBeenCalledTimes(1));
    expect(chat.post).toHaveBeenCalledWith(
      expect.objectContaining({text: 'Not there yet. Add a heading.'})
    );

    listeners[0]({...build, at: 6});
    await waitFor(() => expect(mockValidateStep).toHaveBeenCalledTimes(2));
    expect(recordValidation).toHaveBeenCalledTimes(1);
    expect(chat.post).toHaveBeenCalledTimes(1);
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
