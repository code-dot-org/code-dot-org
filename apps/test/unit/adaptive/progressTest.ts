import {
  EMPTY_PROGRESS,
  Progress,
  checkpointStatus,
  getStatusMap,
} from '@cdo/apps/adaptive/progress';
import {Checkpoint, Pathway} from '@cdo/apps/adaptive/types';

const checkpoint = (id: string, requires?: string[]): Checkpoint => ({
  id,
  title: id,
  description: id,
  requires,
  steps: [
    {
      id: `${id}-step`,
      title: id,
      kind: 'panels',
      panels: [{key: `${id}-1`, imageUrl: 'x.png', text: id}],
    },
  ],
});

const progressOf = (completed: string[], started: string[]): Progress => ({
  ...EMPTY_PROGRESS,
  completed,
  started,
});

const pathway = {
  checkpoints: [
    checkpoint('intro'),
    checkpoint('a', ['intro']),
    checkpoint('b', ['intro', 'a']),
  ],
} as Pathway;

describe('checkpointStatus', () => {
  it('is available with no requires, locked until requires are complete', () => {
    const progress = progressOf([], []);
    expect(checkpointStatus(pathway.checkpoints[0], progress)).toBe(
      'available'
    );
    expect(checkpointStatus(pathway.checkpoints[1], progress)).toBe('locked');
  });

  it('needs every required checkpoint, not just one', () => {
    const progress = progressOf(['intro'], []);
    expect(checkpointStatus(pathway.checkpoints[1], progress)).toBe(
      'available'
    );
    expect(checkpointStatus(pathway.checkpoints[2], progress)).toBe('locked');
  });

  it('reports in progress once started and complete over everything else', () => {
    const progress = progressOf(['intro'], ['a', 'intro']);
    expect(checkpointStatus(pathway.checkpoints[1], progress)).toBe(
      'inProgress'
    );
    expect(checkpointStatus(pathway.checkpoints[0], progress)).toBe('complete');
  });
});

describe('getStatusMap', () => {
  it('maps every checkpoint id to its status', () => {
    expect(getStatusMap(pathway, progressOf(['intro', 'a'], []))).toEqual({
      intro: 'complete',
      a: 'complete',
      b: 'available',
    });
  });
});
