import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';

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
export type EmptyEditorComponent = () => JSX.Element;

export type SideBarItem = {
  icon: string;
  action: () => void;
  label?: string;
};

export type ConfigType = {
  showLeftNav?: boolean;
  showEditor?: boolean;
  showPreview?: boolean;
  showSideBar?: boolean;
  showDebug?: boolean;
  activeLeftNav: string;
  sideBar: SideBarItem[];
  instructions: string | undefined;
  defaultTheme?: EditorTheme;
  leftNav: LeftNavElement[];
  EditorComponent?: EditorComponent;
  editableFileTypes?: string[];
  previewFileTypes?: string[];
  EmptyEditorComponent?: EmptyEditorComponent;
  blankEmptyEditor?: boolean;
  PreviewComponents?: {[key: string]: PreviewComponent};
};

export type ProjectType = MultiFileSource;

export type SetProjectFunction = (project: ProjectType) => void;
export type SetConfigFunction = (project: ConfigType) => void;

export type ReducerAction = {
  type: string;
  payload: unknown;
};

export type EditorTheme = 'light' | 'dark';
