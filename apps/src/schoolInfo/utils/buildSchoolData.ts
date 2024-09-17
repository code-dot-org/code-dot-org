import {
  NO_SCHOOL_SETTING,
  NO_SCHOOL_SETTING_SCHOOL_NAME,
  NON_SCHOOL_OPTIONS_ARRAY,
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';

import {SchoolInfoRequest} from '../types';

export function buildSchoolData({
  schoolId,
  country,
  schoolName,
  schoolZip,
}: {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
}): SchoolInfoRequest | undefined {
  // If we have an NCES id, _only_ send that - everything else will be
  // backfilled by records on the server.
  if (
    country === US_COUNTRY_CODE &&
    schoolId &&
    !NON_SCHOOL_OPTIONS_ARRAY.includes(schoolId)
  ) {
    return {
      user: {
        school_info_attributes: {
          school_id: schoolId,
        },
      },
    };
  }

  if (schoolId === NO_SCHOOL_SETTING) {
    return {
      user: {
        school_info_attributes: {
          country,
          zip: schoolZip,
          school_type: NO_SCHOOL_SETTING,
          school_name: NO_SCHOOL_SETTING_SCHOOL_NAME,
        },
      },
    };
  }

  if (country && country !== SELECT_COUNTRY) {
    return {
      user: {
        school_info_attributes: {
          country,
          school_name: schoolName,
          zip: country === US_COUNTRY_CODE ? schoolZip : undefined,
        },
      },
    };
  }
}
