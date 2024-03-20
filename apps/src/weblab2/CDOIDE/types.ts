export type LeftNavElement = {
  icon: string;
  component: string;
};

export type FileId = string;
export type FolderId = string;

export type PreviewComponent = (args: {file: ProjectFileType}) => JSX.Element;
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
  showRunBar?: boolean;
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

export type ProjectFolderType = {
  id: FolderId;
  name: string;
  parentId: string;
  open?: boolean;
};

export type ProjectFileType = {
  id: FileId;
  name: string;
  language: string;
  contents: string;
  open?: boolean;
  active?: boolean;
  folderId: string;
};

export type ProjectType = {
  folders: Record<string, ProjectFolderType>;
  files: Record<string, ProjectFileType>;
};

export type SetProjectFunction = (project: ProjectType) => void;
export type SetConfigFunction = (project: ConfigType) => void;

export type ReducerAction = {
  type: string;
  payload: unknown;
};

export type EditorTheme = 'light' | 'dark';
