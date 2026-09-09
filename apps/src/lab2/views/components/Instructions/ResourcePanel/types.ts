import {ReactNode} from 'react';

export enum Tabs {
  Instructions = 'instructions',
  AiTutor = 'aiTutor',
  TeachersOnly = 'teachersOnly',
  StudentRubric = 'studentRubric',
  VersionHistory = 'versionHistory',
  Validation = 'validation',
  Backpack = 'backpack',
  StudentResources = 'studentResources',
}

/** Lab-defined tabs shown after Instructions. `id` must not match a built-in tab. */
export interface ExtraTab {
  id: string;
  title: string;
  icon: string;
  content: ReactNode;
}

export interface Setting {
  id: string;
  label: string;
  options: {value: string; text: string}[];
  selectedValue: string | undefined;
  onChange: (value: string) => void;
}
