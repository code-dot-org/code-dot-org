import {Pathway} from '@cdo/apps/adaptive/types';
import {
  completedCount,
  getDestinationProgress,
  getSkillProgress,
} from '@cdo/apps/adaptive/views/map/groupProgress';

const pathway = {
  skills: {
    build: {id: 'build', title: 'Build', description: 'B.', icon: 'wand'},
    debug: {id: 'debug', title: 'Debug', description: 'D.'},
  },
  destinations: {
    style: {title: 'Style', icon: 'palette', color: 'strawberry'},
    hood: {title: 'Under the Hood', icon: 'wrench', color: 'orange'},
  },
  checkpoints: [
    {id: 'intro'},
    {id: 's1', destination: 'style', skillIds: ['build']},
    {id: 's2', destination: 'style', skillIds: ['build', 'debug']},
    {id: 'h1', destination: 'hood', skillIds: ['debug']},
  ],
} as unknown as Pathway;

describe('getSkillProgress', () => {
  it('counts complete and skipped checkpoints per skill, in the pathway order', () => {
    expect(
      getSkillProgress(pathway, {
        intro: 'complete',
        s1: 'complete',
        s2: 'skipped',
        h1: 'available',
      })
    ).toEqual([
      {key: 'build', title: 'Build', icon: 'wand', done: 2, total: 2},
      {key: 'debug', title: 'Debug', icon: undefined, done: 1, total: 2},
    ]);
  });
});

describe('getDestinationProgress', () => {
  it('counts complete and skipped checkpoints per declared destination, in declared order', () => {
    expect(
      getDestinationProgress(pathway, {
        intro: 'complete',
        s1: 'complete',
        s2: 'skipped',
        h1: 'available',
      })
    ).toEqual([
      {
        key: 'style',
        title: 'Style',
        icon: 'palette',
        color: 'strawberry',
        done: 2,
        total: 2,
      },
      {
        key: 'hood',
        title: 'Under the Hood',
        icon: 'wrench',
        color: 'orange',
        done: 0,
        total: 1,
      },
    ]);
  });

  it('is empty for a pathway that declares no destinations', () => {
    expect(
      getDestinationProgress({checkpoints: []} as unknown as Pathway, {})
    ).toEqual([]);
  });
});

describe('completedCount', () => {
  it('counts complete checkpoints only', () => {
    expect(
      completedCount({
        a: 'complete',
        b: 'skipped',
        c: 'inProgress',
        d: 'complete',
      })
    ).toBe(2);
  });
});
