import {parseStudentsCsv} from '@cdo/apps/templates/manageStudents/AddMultipleStudents';

import {assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('parseStudentsCsv', () => {
  it('parses valid optional values without a warning', () => {
    const result = parseStudentsCsv([
      ['Display Name', 'Family Name', 'Age', 'Gender', 'State'],
      ['Ada', 'Lovelace', '18', 'female', 'CA'],
      ['Alan', 'Turing', '21+', 'M', 'ny'],
      ['Sam', 'Taylor', '', 'non-binary', 'fl'],
    ]);

    assert.deepEqual(result.students, [
      {
        name: 'Ada',
        familyName: 'Lovelace',
        age: '18',
        gender: 'f',
        usState: 'CA',
      },
      {
        name: 'Alan',
        familyName: 'Turing',
        age: '21+',
        gender: 'm',
        usState: 'NY',
      },
      {
        name: 'Sam',
        familyName: 'Taylor',
        age: '',
        gender: 'n',
        usState: 'FL',
      },
    ]);
    assert.isNull(result.warning);
  });

  it('leaves invalid optional values blank and returns a warning', () => {
    const result = parseStudentsCsv([
      ['Display Name', 'Family Name', 'Age', 'Gender', 'State'],
      ['Ada', 'Lovelace', 'old', 'unknown', 'XX'],
      ['Lin', 'Torvalds', '', 'M', 'California'],
      ['Grace', '', ' ', ' ', ''],
      ['', 'Ignored', 'old', 'unknown', 'XX'],
    ]);

    assert.deepEqual(result.students, [
      {
        name: 'Ada',
        familyName: 'Lovelace',
        age: '',
        gender: '',
        usState: null,
      },
      {
        name: 'Lin',
        familyName: 'Torvalds',
        age: '',
        gender: 'm',
        usState: null,
      },
      {
        name: 'Grace',
        familyName: null,
        age: '',
        gender: '',
        usState: null,
      },
      {
        name: '',
        familyName: 'Ignored',
        age: '',
        gender: '',
        usState: null,
      },
    ]);
    assert.deepEqual(result.warning, {
      rowCount: 2,
    });
  });

  it('warns when the first row has no header and contains invalid values', () => {
    const result = parseStudentsCsv([['Ada', 'Lovelace', 'old', '', 'CA']]);

    assert.deepEqual(result.warning, {
      rowCount: 1,
    });
  });
});
