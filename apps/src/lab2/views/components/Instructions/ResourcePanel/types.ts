export enum Tabs {
  Instructions = 'instructions',
  AiTutor = 'aiTutor',
  TeachersOnly = 'teachersOnly',
  StudentRubric = 'studentRubric',
  VersionHistory = 'versionHistory',
  Validation = 'validation',
  Backpack = 'backpack',
  StudentResources = 'studentResources',
  QuestionBank = 'questionBank',
  Configuration = 'configuration',
}

export interface Setting {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}
