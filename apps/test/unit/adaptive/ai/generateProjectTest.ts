import {generate} from '@cdo/apps/adaptive/ai/generate';
import {generateProject} from '@cdo/apps/adaptive/ai/generateProject';
import {PROJECT_PROMPT_VERSION} from '@cdo/apps/adaptive/ai/projectPrompt';
import {Progress} from '@cdo/apps/adaptive/progress/model';
import {Checkpoint, LevelStep, Pathway} from '@cdo/apps/adaptive/types';
import {AichatContext} from '@cdo/apps/aichat/types';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({generate: jest.fn()}));
const mockGenerate = generate as jest.Mock;

const step: LevelStep = {
  id: 'generated',
  title: 'Your generated site',
  kind: 'level',
  level: 'generated-level',
  project: true,
  projectPrompt: 'A one-page site.',
};
const checkpoint: Checkpoint = {
  id: 'intro',
  title: 'Intro',
  description: 'Start here.',
  steps: [
    {
      id: 'plan',
      title: 'Plan',
      kind: 'questions',
      questions: [{id: 1, type: 'freeResponse', text: 'What will you make?'}],
    },
    step,
  ],
};
const pathway: Pathway = {
  formatVersion: 4,
  id: 'p',
  title: 'Build a website',
  objective: 'Make a site.',
  project: {templateLevel: 'tmpl', description: 'A site.'},
  skills: {},
  checkpoints: [checkpoint],
};
const context: AichatContext = {
  clientType: AiChatClientTypes.ADAPTIVE,
  currentLevelId: 1,
  scriptId: null,
  channelId: undefined,
};
const progress: Progress = {
  steps: {plan: {timeSpent: 0, answers: {1: [{answerId: 'x', text: 'Rex'}]}}},
};
const sources: ProjectSources = {
  source: {
    folders: {},
    files: {
      '1': {
        id: '1',
        name: 'index.html',
        contents: '<h1>Hi</h1>',
        folderId: '0',
      },
    },
  },
};
const output = {
  name: 'Rex Rules',
  description: 'A site about Rex.',
  files: [{name: 'index.html', contents: '<h1>Rex</h1>'}],
};

const resolve = (
  overrides: Partial<Parameters<typeof generateProject>[0]> = {}
) =>
  generateProject({
    pathway,
    checkpoint,
    step,
    progress,
    projectInfo: {},
    sources,
    aichatContext: context,
    ...overrides,
  });

beforeEach(() => mockGenerate.mockReset());

describe('generateProject', () => {
  it('lays the generated files over the template, with the generated name and description', async () => {
    mockGenerate.mockResolvedValue({output, traceId: 't1'});
    const generated = await resolve();
    expect(generated).toEqual({
      name: 'Rex Rules',
      description: 'A site about Rex.',
      traceId: 't1',
      sources: {
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
      },
    });
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        context,
        trace: {
          name: 'adaptive-project',
          metadata: {
            pathwayId: 'p',
            checkpointId: 'intro',
            stepId: 'generated',
            promptVersion: PROJECT_PROMPT_VERSION,
          },
        },
      })
    );
    expect(mockGenerate.mock.calls[0][0].prompt).toContain('A: Rex');
  });

  it('keeps a name and description the student already gave', async () => {
    mockGenerate.mockResolvedValue({output, traceId: 't1'});
    const generated = await resolve({
      projectInfo: {name: 'Mine', description: 'My own words.'},
    });
    expect(generated).toMatchObject({
      name: 'Mine',
      description: 'My own words.',
    });
  });

  it('is nothing without a generated prompt, answers or text files', async () => {
    expect(
      await resolve({step: {...step, projectPrompt: undefined}})
    ).toBeUndefined();
    expect(await resolve({progress: {steps: {}}})).toBeUndefined();
    expect(await resolve({sources: {source: ''}})).toBeUndefined();
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it('is nothing when adaptive AI is off or the call failed', async () => {
    mockGenerate.mockResolvedValue({});
    expect(await resolve()).toBeUndefined();
    mockGenerate.mockResolvedValue({traceId: 't1'});
    expect(await resolve()).toBeUndefined();
  });

  it('is nothing when no generated file matched the template', async () => {
    mockGenerate.mockResolvedValue({
      output: {...output, files: [{name: 'other.html', contents: ''}]},
      traceId: 't1',
    });
    expect(await resolve()).toBeUndefined();
  });
});
