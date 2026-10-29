import {describe, expect, it} from 'vitest';

import {buildSchoolData} from '../buildSchoolData';

describe('buildSchoolData', () => {
  it('sends only the NCES id for a US school with a real id', () => {
    expect(
      buildSchoolData({
        schoolId: '12345678',
        country: 'US',
        schoolName: 'Example High School',
        schoolZip: '98101',
      }),
    ).toEqual({school_id: '12345678'});
  });

  it('sends country, type and zip for the no-school-setting option', () => {
    expect(
      buildSchoolData({
        schoolId: 'noSchoolSetting',
        country: 'US',
        schoolName: '',
        schoolZip: '98101',
      }),
    ).toEqual({country: 'US', school_type: 'noSchoolSetting', zip: '98101'});
  });

  it('builds nothing for the no-school-setting option without a zip', () => {
    expect(
      buildSchoolData({
        schoolId: 'noSchoolSetting',
        country: 'US',
        schoolName: '',
        schoolZip: '',
      }),
    ).toBeUndefined();
  });

  it('sends a named school with no zip outside the US', () => {
    expect(
      buildSchoolData({
        schoolId: '',
        country: 'CA',
        schoolName: 'Example School',
        schoolZip: '',
      }),
    ).toEqual({country: 'CA', school_name: 'Example School', zip: undefined});
  });

  it('sends a named US school with its zip', () => {
    expect(
      buildSchoolData({
        schoolId: '',
        country: 'US',
        schoolName: 'Example High School',
        schoolZip: '98101',
      }),
    ).toEqual({
      country: 'US',
      school_name: 'Example High School',
      zip: '98101',
    });
  });

  it('falls back to the school name when the id is a non-school placeholder', () => {
    expect(
      buildSchoolData({
        schoolId: 'selectASchool',
        country: 'US',
        schoolName: 'Example High School',
        schoolZip: '98101',
      }),
    ).toEqual({
      country: 'US',
      school_name: 'Example High School',
      zip: '98101',
    });
  });

  it('builds nothing while the country is still unpicked', () => {
    expect(
      buildSchoolData({
        schoolId: '',
        country: 'selectCountry',
        schoolName: 'Example High School',
        schoolZip: '98101',
      }),
    ).toBeUndefined();
  });

  it('builds nothing with a country but no school name', () => {
    expect(
      buildSchoolData({
        schoolId: '',
        country: 'CA',
        schoolName: '',
        schoolZip: '',
      }),
    ).toBeUndefined();
  });
});
