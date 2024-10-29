import {schoolInfoInvalid} from '@cdo/apps/schoolInfo/utils/schoolInfoInvalid';
import {US_COUNTRY_CODE} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

describe('US country selected', () => {
  it('returns true if zip code is missing', () => {
    const result = schoolInfoInvalid({
      country: US_COUNTRY_CODE,
      schoolId: 'abc',
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toBe(true);
  });

  it('returns true if school is not selected and not named', () => {
    const result = schoolInfoInvalid({
      country: US_COUNTRY_CODE,
      schoolId: NonSchoolOptions.SELECT_A_SCHOOL,
      schoolName: '',
      schoolZip: '12345',
    });

    expect(result).toBe(true);
  });

  it('returns false if zip is provided and not in a school setting', () => {
    const result = schoolInfoInvalid({
      country: US_COUNTRY_CODE,
      schoolId: NonSchoolOptions.NO_SCHOOL_SETTING,
      schoolName: '',
      schoolZip: '12345',
    });

    expect(result).toBe(false);
  });

  it('returns false with US and school id from dropdown', () => {
    const result = schoolInfoInvalid({
      country: US_COUNTRY_CODE,
      schoolId: '1',
      schoolName: '',
      schoolZip: '12345',
      schoolsList: [{value: '1', text: 'School 1'}],
    });

    expect(result).toBe(false);
  });

  it('returns false with US and school name', () => {
    const result = schoolInfoInvalid({
      country: US_COUNTRY_CODE,
      schoolId: NonSchoolOptions.CLICK_TO_ADD,
      schoolName: 'Cool School',
      schoolZip: '12345',
    });

    expect(result).toBe(false);
  });
});

describe('non-US country selected', () => {
  it('returns true with only non-US country', () => {
    const result = schoolInfoInvalid({
      country: 'UK',
      schoolId: NonSchoolOptions.SELECT_A_SCHOOL,
      schoolName: '',
      schoolZip: '',
    });

    expect(result).toBe(true);
  });

  it('returns false with non-US and school name', () => {
    const result = schoolInfoInvalid({
      country: 'UK',
      schoolId: NonSchoolOptions.SELECT_A_SCHOOL,
      schoolName: 'UK School',
      schoolZip: '',
    });

    expect(result).toBe(false);
  });
});
