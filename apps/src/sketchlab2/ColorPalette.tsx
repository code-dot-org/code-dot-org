import React from 'react';

import moduleStyles from './styles/color-palette.module.scss';

export interface PaletteColor {
  label: string;
  value: string | null;
}

export const PALETTE_COLORS: PaletteColor[] = [
  {label: 'Default', value: null},
  {label: 'Red', value: '#7b2020'},
  {label: 'Orange', value: '#7a3c12'},
  {label: 'Amber', value: '#5c4a0a'},
  {label: 'Green', value: '#1e5c30'},
  {label: 'Teal', value: '#0d4040'},
  {label: 'Blue', value: '#1a2e72'},
  {label: 'Purple', value: '#3d1a72'},
  {label: 'Pink', value: '#6e1a4e'},
];

interface ColorPaletteProps {
  selectedColor?: string | null;
  onColorSelect: (color: string | null) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onColorSelect,
}) => (
  <div className={moduleStyles.colorPalette}>
    {PALETTE_COLORS.map(({label, value}) => (
      <button
        key={label}
        className={`${moduleStyles.colorSwatch} ${
          value === selectedColor ? moduleStyles.colorSwatchSelected : ''
        } ${value === null ? moduleStyles.colorSwatchDefault : ''}`}
        style={value ? {backgroundColor: value} : undefined}
        onClick={e => {
          e.stopPropagation();
          onColorSelect(value);
        }}
        title={label}
        aria-label={label}
        aria-pressed={value === selectedColor}
        type="button"
      />
    ))}
  </div>
);

export default ColorPalette;
