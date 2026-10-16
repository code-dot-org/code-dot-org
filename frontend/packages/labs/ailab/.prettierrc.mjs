import base from '@code-dot-org/lint-config/prettier/index.mjs';

/*
  This package is moving into the main repo's `apps/` directory, which runs
  prettier 2. Its `trailingComma` default is `es5`, so formatting here under
  the workspace default (`all`) would rewrite two thirds of the source on the
  way over. Settle it here instead; drop this file once the move lands.
*/
export default {...base, trailingComma: 'es5'};
