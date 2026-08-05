import {describe, expect, it} from 'vitest';

import {buildSchoolData} from '@code-dot-org/core/api';

import {
  CLICK_TO_ADD,
  SELECT_A_SCHOOL,
  SELECT_COUNTRY,
  schoolInfoInvalid,
} from '../schoolInfo';

const SCHOOLS = [{value: '100000000001', text: 'Example Elementary School'}];

const BLANK = {
  schoolId: SELECT_A_SCHOOL,
  country: SELECT_COUNTRY,
  schoolName: '',
  schoolZip: '',
  schoolsList: SCHOOLS,
};

describe('schoolInfoInvalid', () => {
  it('is invalid until a country is picked', () => {
    expect(schoolInfoInvalid(BLANK)).toBe(true);
    expect(schoolInfoInvalid({...BLANK, country: ''})).toBe(true);
  });

  it('needs only a school name outside the US', () => {
    expect(schoolInfoInvalid({...BLANK, country: 'CA'})).toBe(true);
    expect(
      schoolInfoInvalid({...BLANK, country: 'CA', schoolName: 'Lycée'}),
    ).toBe(false);
  });

  it('needs a five-digit zip in the US', () => {
    const us = {...BLANK, country: 'US', schoolId: SCHOOLS[0].value};
    expect(schoolInfoInvalid({...us, schoolZip: ''})).toBe(true);
    expect(schoolInfoInvalid({...us, schoolZip: '303'})).toBe(true);
    expect(schoolInfoInvalid({...us, schoolZip: '98101'})).toBe(false);
  });

  it('stays invalid while the US school placeholder is selected', () => {
    expect(
      schoolInfoInvalid({
        ...BLANK,
        country: 'US',
        schoolZip: '98101',
        schoolId: SELECT_A_SCHOOL,
      }),
    ).toBe(true);
  });

  it('needs a typed name when adding a US school manually', () => {
    const manual = {
      ...BLANK,
      country: 'US',
      schoolZip: '98101',
      schoolId: CLICK_TO_ADD,
    };
    expect(schoolInfoInvalid(manual)).toBe(true);
    expect(schoolInfoInvalid({...manual, schoolName: 'New School'})).toBe(
      false,
    );
  });

  it('rejects a US school id that is not in the fetched list', () => {
    expect(
      schoolInfoInvalid({
        ...BLANK,
        country: 'US',
        schoolZip: '98101',
        schoolId: '999999999999',
      }),
    ).toBe(true);
  });

  // This gate and core's request builder live in different packages, and core's
  // updateSchoolInfo silently skips the PATCH when buildSchoolData returns
  // undefined: a gap between them would toast success without saving anything.
  it('builds school data for every submittable state', () => {
    const submittable = [
      {...BLANK, country: 'CA', schoolName: 'Lycée'},
      {...BLANK, country: 'US', schoolZip: '98101', schoolId: SCHOOLS[0].value},
      {
        ...BLANK,
        country: 'US',
        schoolZip: '98101',
        schoolId: CLICK_TO_ADD,
        schoolName: 'New School',
      },
    ];
    for (const state of submittable) {
      expect(schoolInfoInvalid(state)).toBe(false);
      expect(buildSchoolData(state)).toBeDefined();
    }
  });
});
