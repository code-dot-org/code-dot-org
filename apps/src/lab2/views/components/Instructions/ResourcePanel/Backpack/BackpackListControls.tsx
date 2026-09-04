import {IconDropdown} from '@code-dot-org/component-library/dropdown';
import {IconDropdownOption} from '@code-dot-org/component-library/dropdown/iconDropdown';
import React, {useMemo} from 'react';

import {
  ALL_FILES_CATEGORY_ID,
  BackpackSortOrder,
  FileCategoryId,
  getPopulatedCategories,
} from './backpackFileFilters';

import moduleStyles from './backpack-list-controls.module.scss';

const SORT_OPTIONS: IconDropdownOption[] = [
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
    icon: {iconName: 'file', iconStyle: 'regular'},
  },
];

// Helper to auto-close dropdown on select by simulating a mousedown elsewhere.
// Once we migrate to MUI dropdown we shouldn't need this.
function closeOpenDropdownMenu() {
  document.dispatchEvent(new MouseEvent('mousedown'));
}

interface BackpackListControlsProps {
  /** Every file in the backpack, not just the ones currently shown. */
  fileNames: string[];
  selectedCategoryId: FileCategoryId | typeof ALL_FILES_CATEGORY_ID;
  onCategoryChange: (
    categoryId: FileCategoryId | typeof ALL_FILES_CATEGORY_ID
  ) => void;
  sortOrder: BackpackSortOrder;
  onSortOrderChange: (sortOrder: BackpackSortOrder) => void;
}

/** File type filter and sort order pickers for the unified backpack file list. */
const BackpackListControls: React.FC<BackpackListControlsProps> = ({
  fileNames,
  selectedCategoryId,
  onCategoryChange,
  sortOrder,
  onSortOrderChange,
}) => {
  const categoryOptions: IconDropdownOption[] = useMemo(
    () => [
      {
        value: ALL_FILES_CATEGORY_ID,
        label: `All (${fileNames.length})`,
        icon: {iconName: 'backpack', iconStyle: 'solid'},
      },
      ...getPopulatedCategories(fileNames).map(({id, label, icon, count}) => ({
        value: id,
        label: `${label} (${count})`,
        icon,
      })),
    ],
    [fileNames]
  );

  const selectedCategoryOption =
    categoryOptions.find(option => option.value === selectedCategoryId) ||
    categoryOptions[0];
  const selectedSortOption =
    SORT_OPTIONS.find(option => option.value === sortOrder) || SORT_OPTIONS[0];

  return (
    <div className={moduleStyles.listControls}>
      <IconDropdown
        name="backpack-file-type-filter"
        className={moduleStyles.controlDropdown}
        labelText="File type"
        size="xs"
        styleAsFormField
        options={categoryOptions}
        color="gray"
        selectedOption={selectedCategoryOption}
        onChange={option => {
          onCategoryChange(
            option.value as FileCategoryId | typeof ALL_FILES_CATEGORY_ID
          );
          closeOpenDropdownMenu();
        }}
        aria-label={`File type: ${selectedCategoryOption.label}`}
      />
      <IconDropdown
        name="backpack-sort-order"
        className={moduleStyles.controlDropdown}
        labelText="Sort by"
        size="xs"
        styleAsFormField
        menuPlacement="right"
        color="gray"
        options={SORT_OPTIONS}
        selectedOption={selectedSortOption}
        onChange={option => {
          onSortOrderChange(option.value as BackpackSortOrder);
          closeOpenDropdownMenu();
        }}
        aria-label={`Sort by: ${selectedSortOption.label}`}
      />
    </div>
  );
};

export default BackpackListControls;
