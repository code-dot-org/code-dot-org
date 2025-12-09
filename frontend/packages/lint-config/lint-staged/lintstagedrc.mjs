export const DEFAULT_EXTENSIONS_GLOB = '*.{js,cjs,mjs,ts,jsx,tsx}';
export const PRETTIER_EXTENSIONS_GLOB = '*.{json,md}';

function prettierFix(files) {
  return `prettier --write ${files}`;
}

function eslintFix(files) {
  return `eslint --fix ${files}`;
}

function stylelintFix(files) {
  return `stylelint --fix ${files}`;
}

/**
 * Auto-fix JS
 */
export function defaultLintFix(stagedFiles) {
  const files = stagedFiles.join(' ');

  return [eslintFix(files), prettierFix(files)];
}

/**
 * Auto-fix JSON and Markdown
 */
export function prettierLintFix(stagedFiles) {
  const files = stagedFiles.join(' ');

  return [prettierFix(files)];
}

/**
 * Auto-fix CSS files
 */
export function cssLintFix(stagedFiles) {
  const files = stagedFiles.join(' ');

  return [stylelintFix(files), prettierFix(files)];
}

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  [`**/${DEFAULT_EXTENSIONS_GLOB}`]: defaultLintFix,
  [`**/${PRETTIER_EXTENSIONS_GLOB}`]: prettierLintFix,
  '**/*.{css,sass,scss}': cssLintFix,
};
