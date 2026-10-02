export const Tabs = {
  Instructions: 'instructions',
  AiTutor: 'aiTutor',
  TeachersOnly: 'teachersOnly',
  StudentRubric: 'studentRubric',
  VersionHistory: 'versionHistory',
  Validation: 'validation',
} as const;

export type TabsType = (typeof Tabs)[keyof typeof Tabs];

export interface Setting {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}
