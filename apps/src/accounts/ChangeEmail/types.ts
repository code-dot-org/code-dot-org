import {UserTypes} from '@code-dot-org/shared-constants';

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
  onSubmit: () => void;
}
