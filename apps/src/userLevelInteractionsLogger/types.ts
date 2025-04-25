import {ValidationResult} from '@cdo/apps/lab2/progress/ProgressManager';
export interface UserLevelInteraction {
  levelId: number | undefined;
  scriptId: number | undefined;
  schoolYear?: string;
  interaction: string;
  codeVersion?: string;
  metadata?: JSON;
  validationResults?: ValidationResult[];
}
