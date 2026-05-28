import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useMemo} from 'react';

import OptionListDropdownRow from '@cdo/apps/sketchlab/reactFlow/elementToolbars/components/OptionListDropdownRow';
import {
  TEXT_ALIGN_OPTIONS,
  TextAlignValue,
} from '@cdo/apps/sketchlab/reactFlow/elementToolbars/toolbarPalettes';

const DEFAULT_ALIGN_ICON = 'align-center';

interface AlignmentDropdownRowProps {
  value: TextAlignValue;
  onSelect: (next: TextAlignValue) => void;
}

export default function AlignmentDropdownRow({
  value,
  onSelect,
}: AlignmentDropdownRowProps) {
  const selectedOption = useMemo(
    () =>
      TEXT_ALIGN_OPTIONS.find(option => option.value === value) ??
      TEXT_ALIGN_OPTIONS[1],
    [value]
  );
  return (
    <OptionListDropdownRow
      label="Alignment"
      triggerIcon={
        <FontAwesomeV6Icon
          iconName={selectedOption.icon ?? DEFAULT_ALIGN_ICON}
          iconStyle="solid"
        />
      }
      options={TEXT_ALIGN_OPTIONS}
      selectedOption={selectedOption}
      onSelect={onSelect}
    />
  );
}
