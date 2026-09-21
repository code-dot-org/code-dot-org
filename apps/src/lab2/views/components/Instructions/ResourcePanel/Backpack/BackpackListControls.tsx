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

// Helper to auto-close dropdown on select by simulating a mousedown elsewhere.
// The menu is hidden with the option button still focused, so move focus back
// to the trigger button. Once we migrate to MUI dropdown we shouldn't need this.
function closeOpenDropdownMenu(dropdownName: string) {
  document.dispatchEvent(new MouseEvent('mousedown'));
  document.getElementById(`${dropdownName}-dropdown-button`)?.focus();
}

interface BackpackListControlsProps {
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
        name={FILE_TYPE_FILTER_NAME}
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
          closeOpenDropdownMenu(FILE_TYPE_FILTER_NAME);
        }}
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
        onChange={option => {
          onSortOrderChange(option.value as BackpackSortOrder);
          closeOpenDropdownMenu(SORT_ORDER_NAME);
        }}
        aria-label={`Sort by: ${selectedSortOption.label}`}
      />
    </div>
  );
};

export default BackpackListControls;
