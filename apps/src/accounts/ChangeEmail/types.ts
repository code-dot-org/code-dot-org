import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

export type UserType = (typeof UserTypes)[keyof typeof UserTypes];

export interface EmailUpdateValues {
  newEmail?: string;
  currentPassword?: string;
  emailOptIn?: string;
}

export interface ChangeEmailFormProps {
  values: EmailUpdateValues;
  validationErrors: EmailUpdateValues;
  userType: UserType;
  isPasswordRequired: boolean;
  disabled?: boolean;
  onChange: (value: Record<string, unknown>) => void;
}
