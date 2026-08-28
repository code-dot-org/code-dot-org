import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

// The react preset (JSX + node/browser globals) covers this package's own
// Node tooling (src/, scripts/) — see widget-runtime's eslint.config.mjs for
// the same preset applied to a hybrid Node+browser package.
//
// widgets/*/src/** is excluded from this package's own lint pass: it is
// copied VERBATIM from an authoring session (see this package's README) and
// its sourceHash — checked by test:gates — is the whole point of that
// provenance guarantee. Re-linting (or fixing) it after the copy would mean
// this package no longer serves what was actually reviewed. Quality for
// widget source is the contract gates (checkWidgetDocument), not this
// package's eslint config; the widget's own colocated tests still run under
// vitest regardless of this ignore.
export default [
  globalIgnores(['dist', 'widgets/*/src/**']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
];
