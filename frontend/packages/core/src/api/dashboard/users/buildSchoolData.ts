import type {SchoolInfoRequest, UpdateSchoolInfoParams} from './users.types';

const US_COUNTRY_CODE = 'US';

const SELECT_COUNTRY = 'selectCountry';

// Mirrors SharedConstants::NON_SCHOOL_OPTIONS in lib/cdo/shared_constants.rb,
// which core cannot import.
const NON_SCHOOL_OPTIONS = {
  SELECT_A_SCHOOL: 'selectASchool',
  CLICK_TO_ADD: 'clickToAdd',
  NO_SCHOOL_SETTING: 'noSchoolSetting',
} as const;

/** Builds the school_info_attributes body; undefined means nothing to save. */
export function buildSchoolData({
  schoolId,
  country,
  schoolName,
  schoolZip,
}: UpdateSchoolInfoParams): SchoolInfoRequest | undefined {
  // With an NCES id, send only that: the server backfills the rest.
  if (
    country === US_COUNTRY_CODE &&
    schoolId &&
    !Object.values(NON_SCHOOL_OPTIONS).some(option => schoolId === option)
  ) {
    return {
      school_id: schoolId,
    };
  }

  if (
    country === US_COUNTRY_CODE &&
    schoolId === NON_SCHOOL_OPTIONS.NO_SCHOOL_SETTING
  ) {
    if (!schoolZip) {
      return;
    }
    return {
      country,
      school_type: NON_SCHOOL_OPTIONS.NO_SCHOOL_SETTING,
      zip: schoolZip,
    };
  }

  if (country && country !== SELECT_COUNTRY && schoolName) {
    return {
      country,
      school_name: schoolName,
      zip: country === US_COUNTRY_CODE ? schoolZip : undefined,
    };
  }
}
