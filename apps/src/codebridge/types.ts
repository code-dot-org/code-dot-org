import {LanguageSupport} from '@codemirror/language';
import {AnyAction, Dispatch} from 'redux';

import {
  LevelProperties,
  MultiFileSource,
  ProjectFile,
  ProjectSources,
} from '@cdo/apps/lab2/types';

import {LayoutKey} from './constants';

export type {
  FileId,
  FolderId,
  ProjectFolder,
  ProjectFile,
} from '@cdo/apps/lab2/types';

export type LeftNavElement = {
  icon: string;
  component: string;
};

export type PreviewComponent = (args: {file: ProjectFile}) => JSX.Element;
export type EditorComponent = () => JSX.Element;

export type SideBarItem = {
  icon: string;
  action: () => void;
  label?: string;
};

export type ConfigType = {
  defaultTheme?: EditorTheme;
  editableFileTypes: string[];
  PreviewComponents?: {[key: string]: PreviewComponent};
  languageMapping: {[key: string]: LanguageSupport};
  activeLayout?: LayoutKey;
  validMimeTypes?: string[];
  layoutComponents: {
    horizontal?: React.FunctionComponent<LayoutProps>;
    vertical: React.FunctionComponent<LayoutProps>;
    share?: React.FunctionComponent<LayoutProps>;
    widget?: React.FunctionComponent<LayoutProps>;
    fullScreen?: React.FunctionComponent<LayoutProps>;
  };
};

export type SetProjectFunction = (project: ProjectSources) => void;
export type SetConfigFunction = (project: ConfigType) => void;
export type ResetProjectFunction = () => void;
export type OnRunFunction = (
  runTests: boolean,
  dispatch: Dispatch<AnyAction>,
  source: MultiFileSource | undefined
) => Promise<void>;
export type OnStopFunction = () => void;
export type SendConsoleInputFunction = (input: string) => void;

export type ReducerAction = {
  type: string;
  payload: unknown;
};

export type EditorTheme = 'light' | 'dark';

export interface CodebridgeLevelProperties extends LevelProperties {
  validationFile?: ProjectFile;
  enableMicroBit?: boolean;
  miniApp?: string;
  serializedMaze?: MazeCell[][];
  startDirection?: number;
  widgetView?: boolean;
  widgetViewAllowShowCode?: boolean;
}

// Python Lab specific property
export interface MazeCell {
  tileType: number;
  value: number;
  assetId: number;
}

export interface LayoutProps {
  isProjectLevel?: boolean;
  isWidgetView?: boolean;
}

export interface ProjectPickerSettings {
  currentType: string;
  showProjectTypePicker: () => void;
}

export enum RunType {
  RUN,
  TEST, // User-written tests
  VALIDATION, // Levelbuilder-written tests
}
