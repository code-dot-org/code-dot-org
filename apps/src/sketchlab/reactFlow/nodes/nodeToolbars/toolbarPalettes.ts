export interface ColorSwatch {
  value: string;
  label: string;
  transparent?: boolean;
}

export const STROKE_FONT_PALETTE: ColorSwatch[] = [
  {value: 'var(--sketchlab-stroke-black)', label: 'Black'},
  {value: 'var(--sketchlab-stroke-red)', label: 'Red'},
  {value: 'var(--sketchlab-stroke-green)', label: 'Green'},
  {value: 'var(--sketchlab-stroke-blue)', label: 'Blue'},
  {value: 'var(--sketchlab-stroke-orange)', label: 'Orange'},
  {value: 'var(--sketchlab-stroke-purple)', label: 'Purple'},
];

export const BACKGROUND_PALETTE: ColorSwatch[] = [
  {value: 'transparent', label: 'Transparent', transparent: true},
  {value: 'var(--sketchlab-bg-red)', label: 'Red'},
  {value: 'var(--sketchlab-bg-green)', label: 'Green'},
  {value: 'var(--sketchlab-bg-blue)', label: 'Blue'},
  {value: 'var(--sketchlab-bg-orange)', label: 'Orange'},
  {value: 'var(--sketchlab-bg-purple)', label: 'Purple'},
];

export const FONT_SIZE_OPTIONS = [
  {value: 'small', label: 'Small', px: 12},
  {value: 'medium', label: 'Medium', px: 16},
  {value: 'large', label: 'Large', px: 22},
] as const;

export type FontSizeValue = (typeof FONT_SIZE_OPTIONS)[number]['value'];

export const DEFAULT_BACKGROUND_COLOR = 'transparent';
export const DEFAULT_STROKE_COLOR = 'var(--sketchlab-stroke-black)';
export const DEFAULT_FONT_COLOR = 'var(--sketchlab-stroke-black)';
export const DEFAULT_FONT_SIZE: FontSizeValue = 'medium';

export function fontSizePx(value: string | undefined): number | undefined {
  const match = FONT_SIZE_OPTIONS.find(option => option.value === value);
  return match?.px;
}
