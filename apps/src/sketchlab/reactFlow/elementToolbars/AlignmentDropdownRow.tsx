import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React from 'react';

import OptionListPopover from './OptionListPopover';
import ToolbarDropdownRow from './ToolbarDropdownRow';
import {
  TEXT_ALIGN_OPTIONS,
  TextAlignValue,
  textAlignLabel,
} from './toolbarPalettes';

const DEFAULT_ALIGN_ICON = 'align-center';

interface AlignmentDropdownRowProps {
  value: TextAlignValue;
  onSelect: (next: TextAlignValue) => void;
}

export default function AlignmentDropdownRow({
  value,
  onSelect,
}: AlignmentDropdownRowProps) {
  const icon =
    TEXT_ALIGN_OPTIONS.find(o => o.value === value)?.icon ?? DEFAULT_ALIGN_ICON;
  return (
    <ToolbarDropdownRow
      label="Alignment"
      triggerPreview={<FontAwesomeV6Icon iconName={icon} iconStyle="solid" />}
      triggerLabel={textAlignLabel(value)}
      renderPopoverContent={closePopover => (
        <OptionListPopover<TextAlignValue>
          ariaLabel="Alignment"
          options={TEXT_ALIGN_OPTIONS}
          selectedValue={value}
          onSelect={onSelect}
          onClose={closePopover}
        />
      )}
    />
  );
}
