export interface ColorSwatch {
  value: string;
  label: string;
  darkModeLabel?: string;
  transparent?: boolean;
}

export const STROKE_FONT_PALETTE: ColorSwatch[] = [
  {
    value: 'var(--sketchlab-stroke-default)',
    label: 'Black',
    darkModeLabel: 'White',
  },
  {value: 'var(--sketchlab-stroke-red)', label: 'Red'},
  {value: 'var(--sketchlab-stroke-yellow)', label: 'Yellow'},
  {value: 'var(--sketchlab-stroke-green)', label: 'Green'},
  {value: 'var(--sketchlab-stroke-blue)', label: 'Blue'},
  {value: 'var(--sketchlab-stroke-purple)', label: 'Purple'},
  {value: 'var(--sketchlab-stroke-pink)', label: 'Pink'},
];

export const BACKGROUND_PALETTE: ColorSwatch[] = [
  {value: 'transparent', label: 'Transparent', transparent: true},
  {value: 'var(--sketchlab-bg-gray)', label: 'Gray'},
  {value: 'var(--sketchlab-bg-red)', label: 'Red'},
  {value: 'var(--sketchlab-bg-yellow)', label: 'Yellow'},
  {value: 'var(--sketchlab-bg-green)', label: 'Green'},
  {value: 'var(--sketchlab-bg-blue)', label: 'Blue'},
  {value: 'var(--sketchlab-bg-purple)', label: 'Purple'},
  {value: 'var(--sketchlab-bg-pink)', label: 'Pink'},
];

export const FONT_SIZE_OPTIONS = [
  {value: 'small', label: 'Small', px: 12},
  {value: 'medium', label: 'Medium', px: 16},
  {value: 'large', label: 'Large', px: 22},
] as const;

export type FontSizeValue = (typeof FONT_SIZE_OPTIONS)[number]['value'];

export const DEFAULT_BACKGROUND_COLOR = 'transparent';
export const DEFAULT_STROKE_COLOR = 'var(--sketchlab-stroke-default)';
export const DEFAULT_FONT_COLOR = 'var(--sketchlab-stroke-default)';
export const DEFAULT_FONT_SIZE: FontSizeValue = 'medium';

export function fontSizePx(value: string | undefined): number | undefined {
  const match = FONT_SIZE_OPTIONS.find(option => option.value === value);
  return (
    match?.px ||
    FONT_SIZE_OPTIONS.find(option => option.value === DEFAULT_FONT_SIZE)?.px
  );
}
