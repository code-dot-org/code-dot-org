export type AFEEligibilityData = {
  email: string;
  userType: string;
  schoolId: string;
  schoolName: string;
  isEligible: boolean;
  isSignedIn: boolean;
};

export type AFESchoolCheckResult = Pick<
  AFEEligibilityData,
  'email' | 'schoolId' | 'schoolName' | 'isEligible'
>;

export interface AFESchoolCheckProps extends Pick<AFEEligibilityData, 'email'> {
  onComplete: (result: AFESchoolCheckResult) => void;
}

export type AFESchoolCheckFormData = Pick<
  AFEEligibilityData,
  'email' | 'schoolId' | 'schoolName'
> & {
  zipCode: string;
};

export interface AFEFormProps
  extends Pick<
    AFEEligibilityData,
    'email' | 'schoolId' | 'schoolName' | 'isSignedIn'
  > {
  onEligibilityReset: () => void;
}

export type AFEFormData = Pick<
  AFEFormProps,
  'email' | 'schoolId' | 'schoolName'
> & {
  firstName: string;
  lastName: string;
  professionalRole: string;
  gradeBands: string[];
  inspirationKit: boolean;
  consentCSTA: boolean;
  consentAFE: boolean;
};
