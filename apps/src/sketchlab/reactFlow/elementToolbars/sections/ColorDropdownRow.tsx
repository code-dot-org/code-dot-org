import {useTheme} from '@code-dot-org/component-library/common/contexts';
import React from 'react';

import ColorPickerPopover from '@cdo/apps/sketchlab/reactFlow/elementToolbars/components/ColorPickerPopover';
import ColorPreviewSwatch from '@cdo/apps/sketchlab/reactFlow/elementToolbars/components/ColorPreviewSwatch';
import ToolbarDropdownRow from '@cdo/apps/sketchlab/reactFlow/elementToolbars/components/ToolbarDropdownRow';
import {
  ColorSwatch,
  colorLabel,
} from '@cdo/apps/sketchlab/reactFlow/elementToolbars/toolbarPalettes';

interface ColorDropdownRowProps {
  label: string;
  swatches: ColorSwatch[];
  value: string;
  onSelect: (next: string) => void;
}

export default function ColorDropdownRow({
  label,
  swatches,
  value,
  onSelect,
}: ColorDropdownRowProps) {
  const {theme} = useTheme();
  const isDarkMode = theme === 'Dark';
  return (
    <ToolbarDropdownRow
      label={label}
      popoverRole="dialog"
      triggerPreview={<ColorPreviewSwatch value={value} swatches={swatches} />}
      triggerLabel={colorLabel(value, swatches, isDarkMode)}
      renderPopoverContent={closePopover => (
        <ColorPickerPopover
          groupLabel={label}
          swatches={swatches}
          selectedValue={value}
          onSelect={onSelect}
          onClose={closePopover}
        />
      )}
    />
  );
}
