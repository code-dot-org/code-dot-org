import {act, renderHook} from '@testing-library/react-hooks';

import {generateProject} from '@cdo/apps/adaptive/ai/generateProject';
import {PROJECT_PROMPT_VERSION} from '@cdo/apps/adaptive/ai/projectPrompt';
import {LevelStep} from '@cdo/apps/adaptive/types';
import {
  UseGenerateProjectOptions,
  useGenerateProject,
} from '@cdo/apps/adaptive/views/steps/useGenerateProject';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {Channel, ProjectSources} from '@cdo/apps/lab2/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/generateProject', () => ({
  generateProject: jest.fn(),
}));
const mockGenerate = generateProject as jest.Mock;

const step = {
  id: 'starter',
  title: 'Your starter site',
  kind: 'level',
  level: 'x',
  project: true,
  projectPrompt: 'A one-page site.',
} as LevelStep;
const template: ProjectSources = {source: {folders: {}, files: {}}};
const seeded: ProjectSources = {
  source: {
    folders: {},
    files: {
      '1': {
        id: '1',
        name: 'index.html',
        contents: '<h1>Rex</h1>',
        folderId: '0',
      },
    },
  },
};
const channel = {
  id: 'c',
  labConfig: {weblab2: {theme: 'dark'}},
} as unknown as Channel;
const generated = {
  name: 'Rex Rules',
  description: 'A site about Rex.',
  sources: seeded,
  traceId: 'ab'.repeat(16),
};

const options = (
  overrides: Partial<UseGenerateProjectOptions> = {}
): UseGenerateProjectOptions => ({
  shouldGenerate: true,
  pathway: {skills: {}, checkpoints: []} as never,
  checkpoint: {id: 'intro'} as never,
  step,
  progress: {steps: {}},
  projectInfo: {},
  aichatContext: {
    clientType: AiChatClientTypes.ADAPTIVE,
    currentLevelId: 1,
    scriptId: 2,
    channelId: undefined,
  },
  sources: template,
  channel,
  projectManager: {
    updateChannel: jest.fn().mockResolvedValue({}),
  } as unknown as ProjectManager,
  updateSources: jest.fn(),
  ...overrides,
});

const flush = () => act(async () => {});

beforeEach(() => mockGenerate.mockReset());

describe('useGenerateProject', () => {
  it('is resolved at once when told not to generate', () => {
    const {result} = renderHook(() =>
      useGenerateProject(options({shouldGenerate: false}))
    );
    expect(result.current.isResolved).toBe(true);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('waits for the decision, then saves the project, names and describes it, and resolves', async () => {
    mockGenerate.mockResolvedValue(generated);
    const opts = options();
    const {result, rerender} = renderHook(
      (current: UseGenerateProjectOptions) => useGenerateProject(current),
      {initialProps: options({shouldGenerate: undefined, sources: undefined})}
    );
    expect(result.current.isResolved).toBe(false);
    expect(mockGenerate).not.toHaveBeenCalled();

    rerender(opts);
    await flush();

    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({step, sources: template, projectInfo: {}})
    );
    expect(opts.updateSources).toHaveBeenCalledWith(seeded, true);
    expect(opts.projectManager?.updateChannel).toHaveBeenCalledWith(
      {
        name: 'Rex Rules',
        labConfig: {
          weblab2: {theme: 'dark'},
          adaptive: {
            description: 'A site about Rex.',
            generationTraceId: 'ab'.repeat(16),
            generationPromptVersion: PROJECT_PROMPT_VERSION,
          },
        },
      },
      true
    );
    expect(result.current.isResolved).toBe(true);
  });

  it('takes the decision once, so a later no does not stop a generation under way', async () => {
    let settle: (value: typeof generated) => void = () => {};
    mockGenerate.mockReturnValue(
      new Promise<typeof generated>(resolve => (settle = resolve))
    );
    const opts = options();
    const {result, rerender} = renderHook(
      (current: UseGenerateProjectOptions) => useGenerateProject(current),
      {initialProps: opts}
    );
    rerender({...opts, shouldGenerate: false});
    settle(generated);
    await flush();

    expect(opts.updateSources).toHaveBeenCalledWith(seeded, true);
    expect(result.current.isResolved).toBe(true);
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it('leaves the template alone when nothing was generated', async () => {
    mockGenerate.mockResolvedValue(undefined);
    const opts = options();
    const {result} = renderHook(() => useGenerateProject(opts));
    await flush();
    expect(result.current.isResolved).toBe(true);
    expect(opts.updateSources).not.toHaveBeenCalled();
    expect(opts.projectManager?.updateChannel).not.toHaveBeenCalled();
  });

  it('drops a project that lands after the step unmounted', async () => {
    let settle: (value: typeof generated) => void = () => {};
    mockGenerate.mockReturnValue(
      new Promise<typeof generated>(resolve => (settle = resolve))
    );
    const opts = options();
    const {unmount} = renderHook(() => useGenerateProject(opts));
    unmount();
    settle(generated);
    await flush();
    expect(opts.updateSources).not.toHaveBeenCalled();
  });
});
