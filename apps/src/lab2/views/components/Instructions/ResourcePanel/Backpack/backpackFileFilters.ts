import {IconDropdownOption} from '@code-dot-org/component-library/dropdown/iconDropdown';

import {AudioExtension, ImageExtension} from '@cdo/apps/lab2/constants';
import {getFileExtension} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

const BRAND_ICON_CLASS = 'fa-brands';

export const ALL_FILES_ID = 'all';

export type FileExtension =
  | ImageExtension
  | AudioExtension
  | 'html'
  | 'css'
  | 'js'
  | 'py'
  | 'csv'
  | 'json'
  | 'txt'
  | 'md'
  | 'other';

interface FileTypeConfig {
  id: FileExtension;
  label: string;
  icon: IconDropdownOption['icon'];
  extensions: string[];
}

export type PopulatedFileTypes = {config: FileTypeConfig; count: number}[];

// Order here is the order categories appear in the filter menu and in a file-type sort.
// The last entry has no extensions and catches everything the others miss.
const FILE_TYPES: FileTypeConfig[] = [
  {
    id: 'jpeg',
    label: 'JPEG',
    icon: {iconName: 'file-image', iconStyle: 'solid'},
    extensions: ['jpeg', 'jpg'],
  },
  {
    id: 'png',
    label: 'PNG',
    icon: {iconName: 'file-image', iconStyle: 'solid'},
    extensions: ['png'],
  },
  {
    id: 'gif',
    label: 'GIF',
    icon: {iconName: 'file-image', iconStyle: 'solid'},
    extensions: ['gif'],
  },
  {
    id: 'webp',
    label: 'WebP',
    icon: {iconName: 'file-image', iconStyle: 'solid'},
    extensions: ['webp'],
  },
  {
    id: 'wav',
    label: 'WAV',
    icon: {iconName: 'file-music', iconStyle: 'solid'},
    extensions: ['wav'],
  },
  {
    id: 'html',
    label: 'HTML',
    icon: {iconName: 'file-code', iconStyle: 'solid'},
    extensions: ['html'],
  },
  {
    id: 'css',
    label: 'CSS',
    icon: {iconName: 'css', iconStyle: 'regular', className: BRAND_ICON_CLASS},
    extensions: ['css'],
  },
  {
    id: 'js',
    label: 'JavaScript',
    icon: {iconName: 'js', iconStyle: 'regular', className: BRAND_ICON_CLASS},
    extensions: ['js'],
  },
  {
    id: 'py',
    label: 'Python',
    icon: {
      iconName: 'python',
      iconStyle: 'regular',
      className: BRAND_ICON_CLASS,
    },
    extensions: ['py'],
  },
  {
    id: 'csv',
    label: 'CSV',
    icon: {iconName: 'file-spreadsheet', iconStyle: 'solid'},
    extensions: ['csv'],
  },
  {
    id: 'json',
    label: 'JSON',
    icon: {iconName: 'file-code', iconStyle: 'solid'},
    extensions: ['json'],
  },
  {
    id: 'txt',
    label: 'TXT',
    icon: {iconName: 'file-lines', iconStyle: 'solid'},
    extensions: ['txt'],
  },
  {
    id: 'md',
    label: 'Markdown',
    icon: {iconName: 'file-lines', iconStyle: 'solid'},
    extensions: ['md'],
  },
  {
    id: 'other',
    label: 'Other',
    icon: {iconName: 'file', iconStyle: 'solid'},
    extensions: [],
  },
];

const OTHER_CATEGORY = FILE_TYPES[FILE_TYPES.length - 1];

function getFileTypeConfig(fileName: string): FileTypeConfig {
  const fileExtension = getFileExtension(fileName);
  if (!fileExtension) {
    return OTHER_CATEGORY;
  }
  return (
    FILE_TYPES.find(category => category.extensions.includes(fileExtension)) ||
    OTHER_CATEGORY
  );
}

export function findConfigForFile(
  fileName: string,
  populatedFileTypeConfigs: PopulatedFileTypes
): FileTypeConfig {
  const fileExtension = getFileExtension(fileName);
  if (!fileExtension) {
    return OTHER_CATEGORY;
  }
  const foundConfig = populatedFileTypeConfigs.find(({config}) =>
    config.extensions.includes(fileExtension)
  );
  return foundConfig ? foundConfig.config : OTHER_CATEGORY;
}

/**
 * Returns an array of populated file type configurations, including counts for each type.
 * Unsupported file types are folded into the "Other" category.
 */
export function getPopulatedFileTypeConfigs(
  fileNames: string[],
  supportedFileTypes: string[]
): PopulatedFileTypes {
  const countsByExtension = new Map<string, number>();
  let otherCount = 0;
  fileNames.forEach(fileName => {
    const extension = getFileExtension(fileName);
    if (getFileTypeConfig(fileName).extensions.includes(extension)) {
      countsByExtension.set(
        extension,
        (countsByExtension.get(extension) || 0) + 1
      );
    } else {
      // This file has an unknown/non-existent file extension, which will be counted under "Other".
      otherCount += 1;
    }
  });

  const populatedFileTypes: PopulatedFileTypes = [];
  const otherExtensions: string[] = [];
  FILE_TYPES.forEach(fileType => {
    const supportedExtensions: string[] = [];
    let supportedCount = 0;
    fileType.extensions.forEach(extension => {
      const count = countsByExtension.get(extension);
      if (!count) {
        return;
      }
      if (supportedFileTypes.includes(extension)) {
        supportedExtensions.push(extension);
        supportedCount += count;
      } else {
        otherExtensions.push(extension);
        otherCount += count;
      }
    });
    if (supportedExtensions.length > 0) {
      populatedFileTypes.push({
        config: {...fileType, extensions: supportedExtensions},
        count: supportedCount,
      });
    }
  });
  if (otherCount > 0) {
    populatedFileTypes.push({
      config: {...OTHER_CATEGORY, extensions: otherExtensions},
      count: otherCount,
    });
  }
  return populatedFileTypes;
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
      // File type sorting: first by category, then by extension, then by name A-Z.
      return sorted.sort((first, second) => {
        const categoryDifference =
          FILE_TYPES.indexOf(getFileTypeConfig(first.fileName)) -
          FILE_TYPES.indexOf(getFileTypeConfig(second.fileName));
        const extensionDifference = getFileExtension(
          first.fileName
        ).localeCompare(getFileExtension(second.fileName));
        return (
          categoryDifference || extensionDifference || byName(first, second)
        );
      });
  }
}
