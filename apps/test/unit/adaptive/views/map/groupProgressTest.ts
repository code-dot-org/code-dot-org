import {Pathway} from '@cdo/apps/adaptive/types';
import {getSkillProgress} from '@cdo/apps/adaptive/views/map/groupProgress';

const pathway = {
  skills: {
    build: {id: 'build', title: 'Build', description: 'B.', icon: 'wand'},
    debug: {id: 'debug', title: 'Debug', description: 'D.'},
  },
  checkpoints: [
    {id: 'intro'},
    {id: 's1', skillIds: ['build']},
    {id: 's2', skillIds: ['build', 'debug']},
    {id: 'h1', skillIds: ['debug']},
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
