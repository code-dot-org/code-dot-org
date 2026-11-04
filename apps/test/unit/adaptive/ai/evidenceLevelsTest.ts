import {describeEvidenceLevels} from '@cdo/apps/adaptive/ai/evidenceLevels';

describe('describeEvidenceLevels', () => {
  it('names the skill and lists each level', () => {
    expect(
      describeEvidenceLevels({
        id: 'build',
        title: 'Build with AI',
        description: 'Steering AI.',
        evidenceLevels: {'0': 'Nothing yet', '2': 'Asks with details'},
      })
    ).toBe(
      'EVIDENCE LEVELS for the skill "Build with AI": Steering AI.\n- 0: Nothing yet\n- 2: Asks with details'
    );
  });

  it('is empty for a skill with no levels', () => {
    expect(
      describeEvidenceLevels({id: 'b', title: 'B', description: 'd'})
    ).toBe('');
  });
});
