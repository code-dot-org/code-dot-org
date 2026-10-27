import {isAdaptiveAiEnabled} from '@cdo/apps/adaptive/ai/generate';
import {traceDecision} from '@cdo/apps/adaptive/ai/langfuse/trace';
import {Progress} from '@cdo/apps/adaptive/progress';
import {PathwayEvidence} from '@cdo/apps/adaptive/routing/evidence';
import {traceRouting} from '@cdo/apps/adaptive/routing/traceRouting';
import {Pathway} from '@cdo/apps/adaptive/types';

jest.mock('@cdo/apps/adaptive/ai/generate', () => ({
  isAdaptiveAiEnabled: jest.fn(),
}));
jest.mock('@cdo/apps/adaptive/ai/langfuse/trace', () => ({
  traceDecision: jest.fn(),
}));
const mockEnabled = isAdaptiveAiEnabled as jest.Mock;
const mockTraceDecision = traceDecision as jest.Mock;

const pathway = {
  id: 'p',
  checkpoints: [{id: 'intro'}, {id: 'build'}, {id: 'polish'}],
} as unknown as Pathway;

const progress: Progress = {
  steps: {
    try: {
      timeSpent: 0,
      validationHistory: [
        {
          at: '2026-10-27T10:00:00Z',
          pass: true,
          evidenceLevel: 2,
          reason: 'Nice.',
          traceId: 'judge-1',
        },
      ],
    },
  },
};

const evidence: PathwayEvidence = {
  build: {
    skillId: 'build',
    evidenceLevel: 2,
    from: [
      {kind: 'validation', stepId: 'try', at: '2026-10-27T10:00:00Z'},
      {kind: 'questions', stepId: 'quiz', questionId: 1},
    ],
  },
};

const change = {
  pathway,
  progress,
  evidence,
  previous: {intro: 'inProgress', build: 'locked', polish: 'locked'},
  current: {intro: 'complete', build: 'skipped', polish: 'available'},
  levelId: 7,
  scriptId: 3,
} as const;

describe('traceRouting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnabled.mockReturnValue(true);
  });

  it('traces a routed change with the evidence, the judge traces behind it and the next checkpoint', () => {
    traceRouting(change);

    expect(mockTraceDecision).toHaveBeenCalledTimes(1);
    expect(mockTraceDecision).toHaveBeenCalledWith({
      name: 'adaptive-routing',
      levelId: 7,
      input: {
        previousStatus: change.previous,
        evidence: {
          build: {
            skillId: 'build',
            evidenceLevel: 2,
            from: [
              {
                kind: 'validation',
                stepId: 'try',
                at: '2026-10-27T10:00:00Z',
                traceId: 'judge-1',
              },
              {kind: 'questions', stepId: 'quiz', questionId: 1},
            ],
          },
        },
      },
      output: {
        status: change.current,
        changed: [
          {checkpointId: 'intro', from: 'inProgress', to: 'complete'},
          {checkpointId: 'build', from: 'locked', to: 'skipped'},
          {checkpointId: 'polish', from: 'locked', to: 'available'},
        ],
        nextCheckpointId: 'polish',
      },
      metadata: {pathwayId: 'p', scriptId: 3},
    });
  });

  it('traces nothing when only the student changed the map', () => {
    traceRouting({
      ...change,
      previous: {intro: 'available', build: 'locked', polish: 'locked'},
      current: {intro: 'inProgress', build: 'locked', polish: 'locked'},
    });

    expect(mockTraceDecision).not.toHaveBeenCalled();
  });

  it('traces nothing while adaptive AI is off', () => {
    mockEnabled.mockReturnValue(false);

    traceRouting(change);

    expect(mockTraceDecision).not.toHaveBeenCalled();
  });
});
