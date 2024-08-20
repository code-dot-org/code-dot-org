import {getFullName} from '@cdo/apps/templates/manageStudents/utils';

describe('getFullName', function () {
  it('returns accurate name given inputs', function () {
    const student1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
    const student2 = {id: 2, name: 'Student 1'};
    expect(getFullName(student1)).toBe('Student 1 FamNameB');
    expect(getFullName(student2)).toBe('Student 1');
    expect(getFullName('Ada', 'Lovelace')).toBe('Ada Lovelace');
    expect(getFullName('Sza')).toBe('Sza');
  });
});
