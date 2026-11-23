import {
  FINISH_LOCK_FLAG,
  checkpointsToFinish,
  finishLockMessage,
} from '@cdo/apps/adaptive/routing/checkpointsToFinish';
import {Pathway} from '@cdo/apps/adaptive/types';
import DCDO from '@cdo/apps/dcdo';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: jest.fn()},
}));
const mockGet = DCDO.get as jest.Mock;

const checkpoint = (id: string) => ({
  id,
  title: id,
  description: id,
  steps: [],
});
const pathway = (requiredCheckpoints?: number) =>
  ({
    checkpoints: [checkpoint('a'), checkpoint('b'), checkpoint('c')],
    finish: {requiredCheckpoints},
  } as unknown as Pathway);

describe('checkpointsToFinish', () => {
  beforeEach(() => {
    mockGet.mockReset().mockImplementation((_flag, fallback) => fallback);
  });

  it('is absent when the pathway sets no requirement', () => {
    expect(checkpointsToFinish(pathway(), {})).toBeUndefined();
    expect(
      checkpointsToFinish({checkpoints: []} as unknown as Pathway, {})
    ).toBeUndefined();
  });

  it('is absent when the flag is off, and defaults the flag on', () => {
    mockGet.mockReturnValue(false);
    expect(checkpointsToFinish(pathway(2), {})).toBeUndefined();
    expect(mockGet).toHaveBeenCalledWith(FINISH_LOCK_FLAG, true);
  });

  it('counts complete and skipped checkpoints toward the requirement', () => {
    expect(checkpointsToFinish(pathway(2), {})).toBe(2);
    expect(
      checkpointsToFinish(pathway(2), {
        a: 'complete',
        b: 'inProgress',
        c: 'locked',
      })
    ).toBe(1);
    expect(checkpointsToFinish(pathway(2), {a: 'complete', b: 'skipped'})).toBe(
      0
    );
  });

  it('never goes below zero', () => {
    expect(
      checkpointsToFinish(pathway(1), {
        a: 'complete',
        b: 'complete',
        c: 'complete',
      })
    ).toBe(0);
  });

  it('ignores checkpoints the pathway does not have', () => {
    expect(checkpointsToFinish(pathway(1), {ghost: 'complete'})).toBe(1);
  });
});

describe('finishLockMessage', () => {
  it('counts what is left, singular and plural', () => {
    expect(finishLockMessage(1)).toBe(
      "Complete 1 more checkpoint to unlock I'm finished!"
    );
    expect(finishLockMessage(3)).toBe(
      "Complete 3 more checkpoints to unlock I'm finished!"
    );
  });
});
