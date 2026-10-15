import React, {useMemo} from 'react';

import OptionListDropdownRow from '../components/OptionListDropdownRow';
import {
  FONT_FAMILY_OPTIONS,
  FontFamilyValue,
  fontFamilyCss,
} from '../toolbarPalettes';

interface FontFamilyDropdownRowProps {
  value: FontFamilyValue;
  onSelect: (next: FontFamilyValue) => void;
}

export default function FontFamilyDropdownRow({
  value,
  onSelect,
}: FontFamilyDropdownRowProps) {
  const options = useMemo(
    () =>
      FONT_FAMILY_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
        labelStyle: {fontFamily: option.css},
      })),
    []
  );
  const selectedOption = useMemo(
    () => options.find(option => option.value === value) ?? options[0],
    [options, value]
  );
  return (
    <OptionListDropdownRow
      label="Font"
      triggerIcon={
        <span aria-hidden="true" style={{fontFamily: fontFamilyCss(value)}}>
          Aa
        </span>
      }
      options={options}
      selectedOption={selectedOption}
      onSelect={onSelect}
    />
  );
}
