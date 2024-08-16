import {getFullName} from '@cdo/apps/templates/manageStudents/utils';

describe('getFullName', function () {
  it('returns accurate name given inputs', function () {
    const student = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
    expect(getFullName(student)).toBe('Student 1 FamNameB');
    expect(getFullName('Ada', 'Lovelace')).toBe('Ada Lovelace');
    expect(getFullName('Sza')).toBe('Sza');
  });
});
