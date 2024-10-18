interface UserProperties {
  gender_student_input?: string;
  us_state?: string;
  [key: string]: unknown;
}
export interface AccountInformationProps {
  verifiedTeacher: boolean;
  secretPictureAccountOnly: boolean;
  teacherManagedAccount: boolean;
  parentManagedAccount: boolean;
  shouldSeeEditEmailLink: boolean;
  isPasswordRequired: boolean;
  isStudent: boolean;
  migrated: boolean;
  encryptedPasswordPresent: boolean;
  canEditPassword: boolean;
  sponsored: boolean;
  studentInLockoutFlow: boolean;
  showGenderInput: boolean;
  isUSA: boolean;
  ageDropdownOptions: Array<string | number>;
  usStateDropdownOptions: Array<[string, string]>;
  countryCode?: string;
  hashedEmail?: string;
  userType?: string;
  userAge?: string;
  userUsername?: string;
  userDisplayName?: string;
  userEmail?: string;
  userProperties?: UserProperties;
}
