export type LeftNavElement = {
  icon: string;
  component: string;
};

export type ConfigType = {
  showSideBar: boolean;
  showPreview: boolean;
  showRunBar: boolean;
  showDebug: boolean;
  activeLeftNav: string;
  sideBar: string[];
  instructions: string | undefined;
  leftNav: LeftNavElement[];
};

export type ProjectFolderType = {
  id: string;
  name: string;
  parentId?: string;
  open?: boolean;
};

export type ProjectFileType = {
  name: string;
  language: string;
  contents: string;
  open?: boolean;
  active?: boolean;
  folderId?: string;
};

export type ProjectType = {
  folders: Record<string, ProjectFolderType>;
  files: Record<string, ProjectFileType>;
};

export type SetProjectFunction = (project: ProjectType) => void;
export type SetConfigFunction = (project: ConfigType) => void;
