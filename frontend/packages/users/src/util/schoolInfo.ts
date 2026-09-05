// The sentinel values below mirror SharedConstants::NON_SCHOOL_OPTIONS and
// core's private copy in buildSchoolData; core never sends them as school ids.

export const US_COUNTRY_CODE = 'US';

export const SELECT_COUNTRY = 'selectCountry';

export const SELECT_A_SCHOOL = 'selectASchool';

/** School dropdown stand-in for "type the name myself". */
export const CLICK_TO_ADD = 'clickToAdd';

/** The Rails schoolzipsearch route constrains :zip to five digits. */
export const ZIP = /^\d{5}$/;

export interface SchoolOption {
  value: string;
  text: string;
}

interface SchoolFormState {
  schoolId: string;
  country: string;
  schoolName: string;
  schoolZip: string;
  schoolsList: SchoolOption[];
}

/** True while the form cannot produce a saveable school. */
export function schoolInfoInvalid({
  schoolId,
  country,
  schoolName,
  schoolZip,
  schoolsList,
}: SchoolFormState): boolean {
  if (!country || country === SELECT_COUNTRY) return true;

  if (country !== US_COUNTRY_CODE) return !schoolName;

  if (!ZIP.test(schoolZip)) return true;
  if (schoolId === SELECT_A_SCHOOL) return true;
  if (schoolId === CLICK_TO_ADD) return !schoolName;

  return !schoolsList.some(school => school.value === schoolId);
}
