import {getFileNameWithNumberSuffix} from '@codebridge/utils';

describe('getFileNameWithNumberSuffix', function () {
  it('adds a number suffix if there is no numeric suffix', function () {
    expect(getFileNameWithNumberSuffix('main.py')).toBe('main_1.py');
    expect(getFileNameWithNumberSuffix('sample.csv')).toBe('sample_1.csv');
    expect(getFileNameWithNumberSuffix('test_file.py')).toBe('test_file_1.py');
  });
  it('increments the number suffix if there is already a numeric suffix', function () {
    expect(getFileNameWithNumberSuffix('main_1.py')).toBe('main_2.py');
    expect(getFileNameWithNumberSuffix('sample_3.csv')).toBe('sample_4.csv');
    expect(getFileNameWithNumberSuffix('test_file_2.py')).toBe(
      'test_file_3.py'
    );
  });
});
