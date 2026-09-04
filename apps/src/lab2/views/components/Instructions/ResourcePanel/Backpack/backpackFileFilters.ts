import {IconDropdownOption} from '@code-dot-org/component-library/dropdown/iconDropdown';

import {
  SUPPORTED_AUDIO_EXTENSIONS,
  SUPPORTED_IMAGE_EXTENSIONS,
} from '@cdo/apps/lab2/constants';

// FontAwesome only reaches its brand glyphs through `fa-brands`, and IconDropdown
// forwards an option icon's className but not its iconFamily.
const BRAND_ICON_CLASS = 'fa-brands';

export const ALL_FILES_CATEGORY_ID = 'all';

export type FileCategoryId =
  | 'images'
  | 'audio'
  | 'html'
  | 'css'
  | 'javascript'
  | 'python'
  | 'data'
  | 'text'
  | 'other';

interface FileCategory {
  id: FileCategoryId;
  label: string;
  icon: IconDropdownOption['icon'];
  extensions: string[];
}

// Order here is the order categories appear in the filter menu and in a file-type sort.
// The last entry has no extensions and catches everything the others miss.
const FILE_CATEGORIES: FileCategory[] = [
  {
    id: 'images',
    label: 'Images',
    icon: {iconName: 'file-image', iconStyle: 'solid'},
    extensions: SUPPORTED_IMAGE_EXTENSIONS,
  },
  {
    id: 'audio',
    label: 'Audio',
    icon: {iconName: 'file-music', iconStyle: 'solid'},
    extensions: SUPPORTED_AUDIO_EXTENSIONS,
  },
  {
    id: 'html',
    label: 'HTML',
    icon: {iconName: 'file-code', iconStyle: 'solid'},
    extensions: ['html', 'htm'],
  },
  {
    id: 'css',
    label: 'CSS',
    icon: {iconName: 'css', iconStyle: 'regular', className: BRAND_ICON_CLASS},
    extensions: ['css'],
  },
  {
    id: 'javascript',
    label: 'Javascript',
    icon: {iconName: 'js', iconStyle: 'regular', className: BRAND_ICON_CLASS},
    extensions: ['js'],
  },
  {
    id: 'python',
    label: 'Python',
    icon: {
      iconName: 'python',
      iconStyle: 'regular',
      className: BRAND_ICON_CLASS,
    },
    extensions: ['py'],
  },
  {
    id: 'data',
    label: 'Data',
    icon: {iconName: 'file-spreadsheet', iconStyle: 'solid'},
    extensions: ['csv', 'json'],
  },
  {
    id: 'text',
    label: 'Text',
    icon: {iconName: 'file-lines', iconStyle: 'solid'},
    extensions: ['txt', 'md'],
  },
  {
    id: 'other',
    label: 'Other',
    icon: {iconName: 'file', iconStyle: 'solid'},
    extensions: [],
  },
];

const OTHER_CATEGORY = FILE_CATEGORIES[FILE_CATEGORIES.length - 1];

function getFileExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.slice(lastDot + 1).toLowerCase();
}

export function getFileCategory(fileName: string): FileCategory {
  const fileExtension = getFileExtension(fileName);
  if (!fileExtension) {
    return OTHER_CATEGORY;
  }
  return (
    FILE_CATEGORIES.find(category =>
      category.extensions.includes(fileExtension)
    ) || OTHER_CATEGORY
  );
}

/** Categories holding at least one of the given files, in menu order, with their counts. */
export function getPopulatedCategories(fileNames: string[]) {
  const countsById = new Map<FileCategoryId, number>();
  fileNames.forEach(fileName => {
    const {id} = getFileCategory(fileName);
    countsById.set(id, (countsById.get(id) || 0) + 1);
  });
  return FILE_CATEGORIES.filter(category => countsById.has(category.id)).map(
    category => ({...category, count: countsById.get(category.id) as number})
  );
}

export type BackpackSortOrder = 'name-asc' | 'name-desc' | 'file-type';

export function sortBackpackFiles<FileType extends {fileName: string}>(
  files: FileType[],
  sortOrder: BackpackSortOrder
): FileType[] {
  const byName = (first: FileType, second: FileType) =>
    first.fileName.localeCompare(second.fileName);
  const sorted = [...files];
  switch (sortOrder) {
    case 'name-asc':
      return sorted.sort(byName);
    case 'name-desc':
      return sorted.sort((first, second) => byName(second, first));
    case 'file-type':
      return sorted.sort((first, second) => {
        const categoryDifference =
          FILE_CATEGORIES.indexOf(getFileCategory(first.fileName)) -
          FILE_CATEGORIES.indexOf(getFileCategory(second.fileName));
        const extensionDifference = getFileExtension(
          first.fileName
        ).localeCompare(getFileExtension(second.fileName));
        return (
          categoryDifference || extensionDifference || byName(first, second)
        );
      });
  }
}
