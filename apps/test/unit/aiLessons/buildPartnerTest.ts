import {
  projectSourcesFromFiles,
  sourceScopeFor,
} from '@cdo/apps/aiLessons/aiLessonsProjectManager';
import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {generateProjectFiles} from '@cdo/apps/aiLessons/buildPartner';
import {LabStep, LessonPlan} from '@cdo/apps/aiLessons/types';
import {MultiFileSource} from '@cdo/apps/lab2/types';

// Keep the test hermetic: no gateway, no model registry, no capability
// docs (which eagerly load the music toolbox at import time).  jest
// hoists these mocks above the imports.
jest.mock('@cdo/apps/aiLessons/aiLog', () => ({
  loggedGenerateText: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(() => 'model'),
}));
jest.mock('@cdo/apps/aiLessons/aiGatewaySetup', () => ({
  initAiLessonsGatewayContext: jest.fn(),
}));
jest.mock('@cdo/apps/aiLessons/labCapabilities', () => ({
  getCapabilitiesMarkdownFor: jest.fn(() => '(capabilities)'),
}));
jest.mock('@cdo/apps/redux', () => ({
  getStore: jest.fn(),
  registerReducers: jest.fn(),
}));

const mockGenerate = loggedGenerateText as jest.Mock;

const lesson: LessonPlan = {
  formatVersion: 2,
  title: 'Test lesson',
  objective: 'obj',
  steps: [],
  authorInputs: {prompt: ''},
};

function labStep(extra: Partial<LabStep> = {}): LabStep {
  return {
    id: 'build-step',
    kind: 'lab',
    title: 'Build',
    labType: 'weblab2',
    description: '',
    validation: 'none',
    ...extra,
  };
}

describe('sourceScopeFor', () => {
  it('uses the lab type for project steps', () => {
    expect(sourceScopeFor(labStep())).toBe('weblab2');
    expect(sourceScopeFor(labStep({labType: 'music'}))).toBe('music');
  });

  it('scopes sandboxes by segment, falling back to the step id', () => {
    expect(
      sourceScopeFor(
        labStep({
          sourceMode: 'sandbox',
          segment: {id: 'html-tags', title: 'HTML tags'},
        })
      )
    ).toBe('sandbox-html-tags');
    expect(sourceScopeFor(labStep({sourceMode: 'sandbox'}))).toBe(
      'sandbox-build-step'
    );
  });
});

describe('projectSourcesFromFiles', () => {
  it('builds ProjectSources with the first file active and open', () => {
    const sources = projectSourcesFromFiles({
      'index.html': '<h1>hi</h1>',
      'style.css': 'h1 { color: red; }',
    });
    const source = sources.source as MultiFileSource;
    expect(Object.keys(source.files)).toEqual(['1', '2']);
    expect(source.files['1']).toMatchObject({
      name: 'index.html',
      contents: '<h1>hi</h1>',
      active: true,
    });
    expect(source.files['2'].active).toBe(false);
    expect(source.openFiles).toEqual(['1']);
  });
});

describe('generateProjectFiles', () => {
  beforeEach(() => mockGenerate.mockReset());

  it('coerces the model output into sources and diffs changed files', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        files: [
          {filename: 'index.html', contents: '<h1>new</h1>'},
          {filename: 'style.css', contents: 'h1 { color: blue; }'},
        ],
        summary: 'Built your page!',
      },
    });
    const before = projectSourcesFromFiles({
      'index.html': '<h1>old</h1>',
      'style.css': 'h1 { color: blue; }',
    }).source as MultiFileSource;

    const result = await generateProjectFiles({
      lesson,
      step: labStep(),
      prompt: 'make it new',
      inputs: {},
      currentSource: before,
    });

    expect(result.summary).toBe('Built your page!');
    // style.css is byte-identical to before, so only index.html changed.
    expect(result.changedFiles).toEqual(['index.html']);
    const source = result.sources.source as MultiFileSource;
    expect(Object.values(source.files).map(f => f.name)).toEqual([
      'index.html',
      'style.css',
    ]);
  });

  it('feeds the student inputs and current files to the model', async () => {
    mockGenerate.mockResolvedValue({
      output: {files: [{filename: 'index.html', contents: 'x'}], summary: ''},
    });
    const before = projectSourcesFromFiles({'index.html': '<p>mine</p>'})
      .source as MultiFileSource;

    await generateProjectFiles({
      lesson,
      step: labStep(),
      prompt: 'add a footer',
      inputs: {
        artist: {
          questionId: 'artist',
          stepId: 'interview',
          prompt: 'Which artist?',
          answer: 'Beyonce',
          at: '2026-01-01T00:00:00Z',
        },
      },
      currentSource: before,
    });

    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('"Which artist?" → Beyonce');
    expect(args.system).toContain('<p>mine</p>');
    expect(args.prompt).toBe('add a footer');
  });

  it('throws when the model returns no files', async () => {
    mockGenerate.mockResolvedValue({output: {files: [], summary: 'oops'}});
    await expect(
      generateProjectFiles({
        lesson,
        step: labStep(),
        prompt: 'p',
        inputs: {},
      })
    ).rejects.toThrow('did not return any project files');
  });
});
