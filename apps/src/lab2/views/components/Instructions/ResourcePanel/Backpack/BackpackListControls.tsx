import {IconDropdown} from '@code-dot-org/component-library/dropdown';
import {IconDropdownOption} from '@code-dot-org/component-library/dropdown/iconDropdown';
import React, {useMemo} from 'react';

import {
  ALL_FILES_ID,
  BackpackSortOrder,
  FileExtension,
  PopulatedFileTypes,
} from './backpackFileFilters';

import moduleStyles from './backpack-list-controls.module.scss';

const FILE_TYPE_FILTER_NAME = 'backpack-file-type-filter';
const SORT_ORDER_NAME = 'backpack-sort-order';

const SORT_OPTIONS: (IconDropdownOption & {value: BackpackSortOrder})[] = [
  {
    value: 'name-asc',
    label: 'Alphabetical (A-Z)',
    icon: {iconName: 'arrow-down-a-z', iconStyle: 'solid'},
  },
  {
    value: 'name-desc',
    label: 'Alphabetical (Z-A)',
    icon: {iconName: 'arrow-up-a-z', iconStyle: 'solid'},
  },
  {
    value: 'file-type',
    label: 'File type',
    icon: {iconName: 'file-arrow-down', iconStyle: 'solid'},
  },
];

interface BackpackListControlsProps {
  fileNames: string[];
  selectedExtension: FileExtension | typeof ALL_FILES_ID;
  onExtensionChange: (categoryId: FileExtension | typeof ALL_FILES_ID) => void;
  sortOrder: BackpackSortOrder;
  onSortOrderChange: (sortOrder: BackpackSortOrder) => void;
  populatedFileTypeConfigs: PopulatedFileTypes;
}

/** File type filter and sort order pickers for the unified backpack file list. */
const BackpackListControls: React.FC<BackpackListControlsProps> = ({
  fileNames,
  selectedExtension,
  onExtensionChange,
  sortOrder,
  onSortOrderChange,
  populatedFileTypeConfigs,
}) => {
  const categoryOptions: IconDropdownOption[] = useMemo(
    () => [
      {
        value: ALL_FILES_ID,
        label: `All (${fileNames.length})`,
        icon: {iconName: 'backpack', iconStyle: 'solid'},
      },
      ...populatedFileTypeConfigs.map(({config, count}) => ({
        value: config.id,
        label: `${config.label} (${count})`,
        icon: config.icon,
      })),
    ],
    [fileNames.length, populatedFileTypeConfigs]
  );

  const selectedCategoryOption =
    categoryOptions.find(option => option.value === selectedExtension) ||
    categoryOptions[0];
  const selectedSortOption =
    SORT_OPTIONS.find(option => option.value === sortOrder) || SORT_OPTIONS[0];

  return (
    <div className={moduleStyles.listControls}>
      <IconDropdown
        name={FILE_TYPE_FILTER_NAME}
        className={moduleStyles.controlDropdown}
        labelText="File type"
        size="xs"
        styleAsFormField
        options={categoryOptions}
        color="gray"
        selectedOption={selectedCategoryOption}
        onChange={option =>
          onExtensionChange(option.value as FileExtension | typeof ALL_FILES_ID)
        }
        aria-label={`File type: ${selectedCategoryOption.label}`}
      />
      <IconDropdown
        name={SORT_ORDER_NAME}
        className={moduleStyles.controlDropdown}
        labelText="Sort by"
        size="xs"
        styleAsFormField
        menuPlacement="right"
        color="gray"
        options={SORT_OPTIONS}
        selectedOption={selectedSortOption}
        onChange={option =>
          onSortOrderChange(option.value as BackpackSortOrder)
        }
        aria-label={`Sort by: ${selectedSortOption.label}`}
      />
    </div>
  );
};

export default BackpackListControls;
