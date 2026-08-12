import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {generateTutorReply} from '@cdo/apps/aiLessons/tutor';
import {LessonPlan, Step, stepShowsChecklist} from '@cdo/apps/aiLessons/types';

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

const mockGenerate = loggedGenerateText as jest.Mock;

const projectStep: Step = {
  id: 'build',
  kind: 'lab',
  title: 'Build it',
  labType: 'weblab2',
  description: 'work on the project',
  validation: 'none',
};

const sandboxStep: Step = {
  ...projectStep,
  id: 'practice',
  sourceMode: 'sandbox',
};

const lesson: LessonPlan = {
  formatVersion: 2,
  title: 'Checklist lesson',
  objective: 'obj',
  steps: [projectStep, sandboxStep],
  checklist: [
    {id: 'header', label: 'Page has a header'},
    {id: 'image', label: 'At least one image'},
  ],
  authorInputs: {prompt: ''},
};

describe('stepShowsChecklist', () => {
  it('is true only on project-mode lab steps of a checklist lesson', () => {
    expect(stepShowsChecklist(lesson, projectStep)).toBe(true);
    expect(stepShowsChecklist(lesson, sandboxStep)).toBe(false);
    expect(stepShowsChecklist({...lesson, checklist: []}, projectStep)).toBe(
      false
    );
  });
});

describe('generateTutorReply checklist handling', () => {
  beforeEach(() =>
    mockGenerate.mockReset().mockResolvedValue({
      output: {message: 'hi', action: 'stay'},
    })
  );

  it('carries the checklist and its state in the system prompt', async () => {
    await generateTutorReply(lesson, 0, [], undefined, undefined, {
      header: true,
    });
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).toContain('PROJECT CHECKLIST');
    expect(args.system).toContain('[x] header: Page has a header');
    expect(args.system).toContain('[ ] image: At least one image');
  });

  it('omits the checklist section on sandbox steps', async () => {
    await generateTutorReply(lesson, 1, []);
    const args = mockGenerate.mock.calls[0][1];
    expect(args.system).not.toContain('PROJECT CHECKLIST');
  });

  it('coerces per-item verdicts, dropping malformed entries', async () => {
    mockGenerate.mockResolvedValue({
      output: {
        message: 'nice header!',
        action: 'stay',
        checklist: [
          {id: 'header', done: true},
          {id: 'image', done: 'yes'},
          {done: false},
        ],
      },
    });
    const reply = await generateTutorReply(lesson, 0, []);
    expect(reply.checklist).toEqual([{id: 'header', done: true}]);
  });

  it('leaves checklist undefined when the model omits it', async () => {
    const reply = await generateTutorReply(lesson, 0, []);
    expect(reply.checklist).toBeUndefined();
  });
});
