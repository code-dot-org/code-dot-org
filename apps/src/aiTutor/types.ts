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
  hiddenSourceCode?: string;
  readOnlySourceCode?: string;
  validationContents?: string;
  validationResults?: string;
  longInstructions?: string;
  documentation?: string;
  documentationLocation?: string;
  consoleOutput?: string;
  hasRun?: boolean;
  hasEdited?: boolean;
}

export interface AnalyticsData {
  labType?: string;
  channelId?: string;
  location: string;
  levelId?: number;
  unitId?: number;
}

export type MaybePromise<T> = T | Promise<T>;
