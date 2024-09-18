import {buildSchoolData} from '@cdo/apps/schoolInfo/utils/buildSchoolData';
import {
  NO_SCHOOL_SETTING,
  NO_SCHOOL_SETTING_SCHOOL_NAME,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';

describe('buildSchoolData', () => {
  it('should return school info with school_id when country is US and schoolId is provided and not in NON_SCHOOL_OPTIONS_ARRAY', () => {
    const result = buildSchoolData({
      schoolId: '12345',
      country: US_COUNTRY_CODE,
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

  it('should return school info with country, school_name, and zip when country is US', () => {
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

  it('should return school info with country and no schoolId when country is not US_COUNTRY_CODE', () => {
    const result = buildSchoolData({
      schoolId: '12345',
      country: 'CA',
      schoolName: 'Test School',
      schoolZip: '',
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

  it('should return school info with country, zip, schoolType, and schoolName when schoolId is NO_SCHOOL_SETTING', () => {
    const result = buildSchoolData({
      schoolId: NO_SCHOOL_SETTING,
      country: 'US',
      schoolName: '',
      schoolZip: '12345',
    });

    expect(result).toEqual({
      user: {
        school_info_attributes: {
          country: 'US',
          school_name: NO_SCHOOL_SETTING_SCHOOL_NAME,
          zip: '12345',
          school_type: NO_SCHOOL_SETTING,
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
});
