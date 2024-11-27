import {
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import {NonSchoolOptions} from '@cdo/generated-scripts/sharedConstants';

import {SchoolDropdownOption} from '../types';

export function schoolInfoInvalid({
  country,
  schoolName,
  schoolZip,
  schoolId,
  schoolsList,
}: {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
  schoolsList: SchoolDropdownOption[];
}): boolean {
  const countryExists = country && country !== SELECT_COUNTRY;

  if (!countryExists) {
    // disabled if country is not selected
    return true;
  }

  // for non-US countries
  if (country !== US_COUNTRY_CODE) {
    // disable true if no school/organization name
    return !schoolName;
  }

  // for US country
  // must have zip code to enable school list dropdown where click to add and non school setting are selectable
  const hasZip = Boolean(schoolZip);
  if (!hasZip) {
    return true;
  }
  // disable true if school is not selected
  if (schoolId === NonSchoolOptions.SELECT_A_SCHOOL) {
    return true;
  }
  // for non school settings, don't disable
  if (schoolId === NonSchoolOptions.NO_SCHOOL_SETTING) {
    return false;
  }
  // if school not in list, disable true if no name
  if (schoolId === NonSchoolOptions.CLICK_TO_ADD) {
    return !schoolName;
  }

  // if schoolId exists, don't disable unless selected school is not in the schools list
  if (schoolId && schoolsList.some(({value}) => schoolId === value)) {
    return false;
  }
  // disable by default
  return true;
}
