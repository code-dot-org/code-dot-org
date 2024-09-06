import {
  NON_SCHOOL_OPTIONS_ARRAY,
  US_COUNTRY_CODE,
} from '@cdo/apps/schoolInfo/constants';
import {buildSchoolData} from '@cdo/apps/schoolInfo/utils/buildSchoolData';

describe('buildSchoolData', () => {
  it('should return school info with school_id when schoolId is provided and not in NON_SCHOOL_OPTIONS_ARRAY', () => {
    const result = buildSchoolData({
      schoolId: '12345',
      country: '',
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toEqual({
      user: {
        school_info_attributes: {
          school_id: '12345',
        },
      },
    });
  });

  it('should return school info with country, school_name, and zip when country is provided and US_COUNTRY_CODE', () => {
    const result = buildSchoolData({
      schoolId: '',
      country: US_COUNTRY_CODE,
      schoolName: 'Test School',
      schoolZip: '12345',
    });

    expect(result).toEqual({
      user: {
        school_info_attributes: {
          country: US_COUNTRY_CODE,
          school_name: 'Test School',
          zip: '12345',
        },
      },
    });
  });

  it('should return school info with country and no zip when country is not US_COUNTRY_CODE', () => {
    const result = buildSchoolData({
      schoolId: '',
      country: 'CA',
      schoolName: 'Test School',
      schoolZip: '12345',
    });

    expect(result).toEqual({
      user: {
        school_info_attributes: {
          country: 'CA',
          school_name: 'Test School',
        },
      },
    });
  });

  it('should return undefined when neither schoolId nor country is provided', () => {
    const result = buildSchoolData({
      schoolId: '',
      country: '',
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined when schoolId is in NON_SCHOOL_OPTIONS_ARRAY', () => {
    const nonSchoolOption = NON_SCHOOL_OPTIONS_ARRAY[0];
    const result = buildSchoolData({
      schoolId: nonSchoolOption,
      country: '',
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toBeUndefined();
  });
});
