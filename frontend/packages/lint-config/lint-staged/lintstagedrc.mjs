export const DEFAULT_EXTENSIONS_GLOB = '*.{js,cjs,mjs,ts,jsx,tsx,json,md}';

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
 * Auto-fix JS, JSON, and Markdown
 */
export function defaultLintFix(stagedFiles) {
  const files = stagedFiles.join(' ');

  return [eslintFix(files), prettierFix(files)];
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
  '**/*.{css,sass,scss}': cssLintFix,
};
