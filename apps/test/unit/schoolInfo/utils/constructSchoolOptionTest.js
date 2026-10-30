import {constructSchoolOption} from '@cdo/apps/schoolInfo/utils/constructSchoolOption';

describe('constructSchoolOption', () => {
  it('should construct SchoolDropdownOption from valid school object', () => {
    const school = {
      nces_id: 12345,
      name: 'Test School',
    };

    const result = constructSchoolOption(school);

    expect(result).toEqual({
      value: '12345',
      text: 'Test School',
    });
  });
});
