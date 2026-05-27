import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import FontSizeCustomInput from './FontSizeCustomInput';
import OptionListPopover from './OptionListPopover';
import ToolbarDropdownRow from './ToolbarDropdownRow';
import {FONT_SIZE_OPTIONS, FontSize, fontSizeLabel} from './toolbarPalettes';

interface SizeDropdownRowProps {
  value: FontSize;
  onSelect: (next: FontSize) => void;
}

export default function SizeDropdownRow({
  value,
  onSelect,
}: SizeDropdownRowProps) {
  const isCustom = typeof value === 'number';
  return (
    <ToolbarDropdownRow
      label="Size"
      triggerPreview={
        <FontAwesomeV6Icon iconName="text-height" iconStyle="solid" />
      }
      triggerLabel={fontSizeLabel(value)}
      renderPopoverContent={closePopover => (
        <OptionListPopover<FontSize>
          ariaLabel="Size"
          options={FONT_SIZE_OPTIONS}
          selectedValue={isCustom ? undefined : value}
          onSelect={onSelect}
          onClose={closePopover}
          customRow={
            <FontSizeCustomInput
              selectedValue={value}
              onSelect={onSelect}
              onClose={closePopover}
              isSelected={isCustom}
            />
          }
        />
      )}
    />
  );
}
