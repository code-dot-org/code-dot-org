import {AdaptiveContent, nextStepId, stepById} from '@cdo/apps/adaptive/types';

const content: AdaptiveContent = {
  formatVersion: 1,
  id: 'sample',
  title: 'Sample',
  steps: [
    {id: 'a', kind: 'panels', title: 'A', panels: []},
    {id: 'b', kind: 'panels', title: 'B', panels: [], next: 'd'},
    {id: 'c', kind: 'panels', title: 'C', panels: [], next: 'end'},
    {id: 'd', kind: 'panels', title: 'D', panels: [], next: 'missing'},
    {id: 'e', kind: 'panels', title: 'E', panels: []},
  ],
};

describe('nextStepId', () => {
  it('defaults to the following step in array order', () => {
    expect(nextStepId(content, 'a')).toBe('b');
  });

  it('follows an explicit next pointer', () => {
    expect(nextStepId(content, 'b')).toBe('d');
  });

  it("ends the lesson on 'end', a dangling pointer, or the last step", () => {
    expect(nextStepId(content, 'c')).toBeNull();
    expect(nextStepId(content, 'd')).toBeNull();
    expect(nextStepId(content, 'e')).toBeNull();
  });

  it('ends the lesson for an unknown step', () => {
    expect(nextStepId(content, 'nope')).toBeNull();
  });
});

describe('stepById', () => {
  it('finds a step and tolerates null', () => {
    expect(stepById(content, 'c')?.title).toBe('C');
    expect(stepById(content, null)).toBeUndefined();
  });
});
