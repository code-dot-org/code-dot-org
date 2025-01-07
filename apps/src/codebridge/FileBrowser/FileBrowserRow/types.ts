import {ProjectFile, ProjectFolder} from '@codebridge/types';

export type DropdownOptionType = {
  condition: boolean;
  iconName: string;
  labelText: string;
  clickHandler: () => void;
  id?: string;
};

type FileBrowserRowItemType = ProjectFile | ProjectFolder;
export type FileBrowserIconComponentType = React.FunctionComponent<{
  item: FileBrowserRowItemType;
}>;
export type FileBrowserNameComponentType = React.FunctionComponent<{
  item: FileBrowserRowItemType;
}>;

export type ItemRowProps = {
  item: FileBrowserRowItemType;
  // If the pop-up menu is enabled, we will show the 3-dot menu button on hover.
  enableMenu: boolean;
  dropdownOptions: DropdownOptionType[];
  IconComponent: FileBrowserIconComponentType;
  NameComponent: FileBrowserNameComponentType;
  openFunction: (id: string) => void;
};
