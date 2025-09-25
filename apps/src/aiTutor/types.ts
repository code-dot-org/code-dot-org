export interface StudentServerData {
  id: number;
  name: string;
  ai_tutor_access_denied: boolean;
}

export interface StudentAccessData {
  id: number;
  name: string;
  aiTutorAccessDenied: boolean;
}

export interface AiTutorContext {
  sourceCode?: string;
  validationContents?: string;
  validationResults?: string;
  longInstructions?: string;
  documentation?: string;
}
