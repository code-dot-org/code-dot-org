import React from 'react';

import moduleStyles from './styles/node-palette.module.scss';

export interface PaletteColor {
  label: string;
  value: string | null;
}

export const PALETTE_COLORS: PaletteColor[] = [
  {label: 'Default', value: null},
  {label: 'Transparent', value: 'transparent'},
  {label: 'Red', value: '#7b2020'},
  {label: 'Orange', value: '#7a3c12'},
  {label: 'Amber', value: '#5c4a0a'},
  {label: 'Green', value: '#1e5c30'},
  {label: 'Teal', value: '#0d4040'},
  {label: 'Blue', value: '#1a2e72'},
  {label: 'Purple', value: '#3d1a72'},
  {label: 'Pink', value: '#6e1a4e'},
];

export type NodeShape = 'rectangle' | 'circle' | 'triangle';

export const PALETTE_SHAPES: {
  label: string;
  value: NodeShape;
  icon: React.ReactNode;
}[] = [
  {
    label: 'Rectangle',
    value: 'rectangle',
    icon: (
      <svg width="18" height="14" viewBox="0 0 18 14">
        <rect
          x="1"
          y="1"
          width="16"
          height="12"
          rx="2"
          ry="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: 'Circle',
    value: 'circle',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: 'Triangle',
    value: 'triangle',
    icon: (
      <svg width="18" height="16" viewBox="0 0 18 16">
        <polygon
          points="9,1 17,15 1,15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

interface NodePaletteProps {
  selectedColor?: string | null;
  onColorSelect: (color: string | null) => void;
  selectedShape?: NodeShape;
  onShapeSelect?: (shape: NodeShape) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({
  selectedColor,
  onColorSelect,
  selectedShape,
  onShapeSelect,
}) => (
  <div className={moduleStyles.colorPalette}>
    {onShapeSelect && (
      <>
        <div className={moduleStyles.paletteRow}>
          {PALETTE_SHAPES.map(({label, value, icon}) => (
            <button
              key={value}
              className={`${moduleStyles.shapeButton} ${
                value === (selectedShape ?? 'rectangle')
                  ? moduleStyles.shapeButtonSelected
                  : ''
              }`}
              onClick={e => {
                e.stopPropagation();
                onShapeSelect(value);
              }}
              title={label}
              aria-label={label}
              aria-pressed={value === (selectedShape ?? 'rectangle')}
              type="button"
            >
              {icon}
            </button>
          ))}
        </div>
        <div className={moduleStyles.paletteDivider} />
      </>
    )}
    <div className={moduleStyles.paletteRow}>
      {PALETTE_COLORS.map(({label, value}) => (
        <button
          key={label}
          className={`${moduleStyles.colorSwatch} ${
            value === selectedColor ? moduleStyles.colorSwatchSelected : ''
          } ${value === null ? moduleStyles.colorSwatchDefault : ''} ${
            value === 'transparent' ? moduleStyles.colorSwatchTransparent : ''
          }`}
          style={
            value && value !== 'transparent'
              ? {backgroundColor: value}
              : undefined
          }
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
  </div>
);

export default NodePalette;
