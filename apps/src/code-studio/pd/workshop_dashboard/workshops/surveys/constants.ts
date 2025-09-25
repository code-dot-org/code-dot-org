export const LIKERT_QUESTION_FOOTER = 'Based on a 7-point agreement scale';
export const PROMOTER_QUESTION_FOOTER = 'Based on a 10-point rating';

export const CRITICAL_CONCERN_LIMIT = 50;
export const NEEDS_ATTENTION_LIMIT = 70;

export type ColorMapKey = typeof COLOR_MAP extends Map<infer K, unknown>
  ? K
  : never;

export const COLOR_MAP = new Map([
  ['success', 'var(--background-success-primary, #3EA33E)'],
  ['warning', 'var(--background-warning-primary, #F9CB28)'],
  ['error', 'var(--background-error-primary, #E02D16)'],
  ['neutral', 'var(--background-neutral-septenary, #768699)'],
  ['light-gray', 'var(--borders-neutral-light, #DFE3E9)'],
  ['green', 'var(--sentiment-success-50, #3EA33E)'],
  ['orange', 'var(--accent-orange-50, #FFB42E)'],
  ['red', 'var(--accent-strawberry-50, #ED6060)'],
  ['teal', 'var(--brand-teal-50, #0093A4)'],
  ['purple', 'var(--brand-purple-50, #8c52ba)'],
  ['aqua', 'var(--brand-aqua-50, #3cfff7)'],
] as const);
