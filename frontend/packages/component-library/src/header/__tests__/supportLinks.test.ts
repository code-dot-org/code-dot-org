import {getSupportLinks} from '../shared/supportLinks';

describe('getSupportLinks', () => {
  it('gives teachers the forum link', () => {
    expect(getSupportLinks('teacher').map(l => l.label)).toEqual([
      'Help and support',
      'Report a problem',
      'Teacher forum',
    ]);
  });

  it('omits the forum for students', () => {
    expect(getSupportLinks('student').map(l => l.label)).toEqual([
      'Help and support',
      'Report a problem',
    ]);
  });
});
