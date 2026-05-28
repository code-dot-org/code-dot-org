import React from 'react';

import OptionListPopover, {OptionListItem} from './OptionListPopover';
import ToolbarDropdownRow from './ToolbarDropdownRow';

interface OptionListDropdownRowProps<T extends string | number> {
  label: string;
  triggerIcon: React.ReactNode;
  options: readonly OptionListItem<T>[];
  selectedOption: OptionListItem<T>;
  onSelect: (value: T) => void;
}

export default function OptionListDropdownRow<T extends string | number>({
  label,
  triggerIcon,
  options,
  selectedOption,
  onSelect,
}: OptionListDropdownRowProps<T>) {
  return (
    <ToolbarDropdownRow
      label={label}
      triggerPreview={triggerIcon}
      triggerLabel={selectedOption.label}
      renderPopoverContent={closePopover => (
        <OptionListPopover<T>
          ariaLabel={label}
          options={options}
          selectedValue={selectedOption.value}
          onSelect={onSelect}
          onClose={closePopover}
        />
      )}
    />
  );
}
