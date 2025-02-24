export const DEFAULT_EXTENSIONS_GLOB = '*.{js,cjs,mjs,ts,jsx,tsx,json,md}';

export function defaultLintFix(stagedFiles) {
  const files = stagedFiles.join(' ');

  return [`eslint --fix ${files}`, `prettier --write ${files}`];
}

export function styleLintFix(stagedFiles) {
  const files = stagedFiles.join(' ');

  return [`stylelint --fix ${files}`];
}

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  [`**/${DEFAULT_EXTENSIONS_GLOB}`]: defaultLintFix,
  '**/*.{css,sass,scss}': styleLintFix,
};
