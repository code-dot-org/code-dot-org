export interface UserLevelInteraction {
  levelId: number | undefined;
  scriptId: number | undefined;
  schoolYear?: string;
  interaction: string;
  codeVersion?: string;
  metadata?: JSON;
  validationResults?: {
    message: string;
    result: string;
  }[];
}
