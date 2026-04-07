export const Tabs = {
  Instructions: 'instructions',
  AiTutor: 'aiTutor',
  TeachersOnly: 'teachersOnly',
  StudentRubric: 'studentRubric',
  VersionHistory: 'versionHistory',
  Validation: 'validation',
} as const;

export type TabsType = (typeof Tabs)[keyof typeof Tabs];

export interface SettingBase {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  onChange: (value: string) => void;
}

export interface SettingWithMaybeValue extends SettingBase {
  selectedValue: string | undefined;
}

export interface SettingWithValue extends SettingBase {
  selectedValue: string;
}

export type Setting = SettingWithValue | SettingWithMaybeValue;
