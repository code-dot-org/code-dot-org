import {loggedGenerateText} from '@cdo/apps/aiLessons/aiLog';
import {recordProgressEvent} from '@cdo/apps/aiLessons/studentProgress';
import {LessonPlan} from '@cdo/apps/aiLessons/types';
import HttpClient from '@cdo/apps/util/HttpClient';

// Keep the test hermetic: no gateway, no model registry, no network.
// jest hoists these mocks above the imports.
jest.mock('@cdo/apps/aiLessons/aiLog', () => ({
  loggedGenerateText: jest.fn(),
}));
jest.mock('@cdo/apps/aichat/api/client/helpers/modelHelpers', () => ({
  getModel: jest.fn(() => 'model'),
}));
jest.mock('@cdo/apps/aiLessons/aiGatewaySetup', () => ({
  initAiLessonsGatewayContext: jest.fn(),
}));
jest.mock('@cdo/apps/util/HttpClient', () => ({
  put: jest.fn(),
  get: jest.fn(),
}));

const mockGenerate = loggedGenerateText as jest.Mock;
const mockPut = HttpClient.put as jest.Mock;

const lesson: LessonPlan = {
  formatVersion: 2,
  id: 'tree',
  title: 'Tree lesson',
  objective: 'obj',
  authorInputs: {prompt: ''},
  steps: [
    {
      id: 'hub',
      kind: 'hub',
      title: 'Skill map',
      paths: [
        {
          id: 'p1',
          title: 'Prompting',
          objective: 'Write structural prompts.',
          standard: 'CSTA-1B-AP-15',
          steps: ['s1', 's2'],
        },
      ],
    },
    {
      id: 's1',
      kind: 'lab',
      title: 's1',
      labType: 'weblab2',
      description: '',
      validation: 'none',
    },
    {
      id: 's2',
      kind: 'lab',
      title: 's2',
      labType: 'weblab2',
      description: '',
      validation: 'none',
    },
  ],
};

describe('recordProgressEvent summary prompt', () => {
  beforeEach(() => {
    mockGenerate.mockReset().mockResolvedValue({output: {summary: 'ok'}});
    mockPut.mockReset().mockResolvedValue(undefined);
  });

  it('describes skill-path progress with objectives and standards', async () => {
    const snapshot = await recordProgressEvent('tree', {
      type: 'checkpoint-completed',
      checkpointIndex: 1,
      lesson,
      completedStepIds: ['s1'],
    });

    const args = mockGenerate.mock.calls[0][1];
    expect(args.prompt).toContain('Skill hub "Skill map"');
    expect(args.prompt).toContain(
      'Prompting [standard: CSTA-1B-AP-15] — Write structural prompts.: 1/2 steps complete'
    );
    expect(snapshot.completedStepIds).toEqual(['s1']);
  });

  it('omits the skill-path section for hub-less lessons', async () => {
    await recordProgressEvent('flat', {
      type: 'run',
      checkpointIndex: 0,
      lesson: {...lesson, steps: lesson.steps.slice(1)},
    });
    expect(mockGenerate.mock.calls[0][1].prompt).not.toContain('Skill hub');
  });
});
