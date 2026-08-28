// Public API for @code-dot-org/widgets-catalog — see README.md.
export type {
  BuildWidgetFailure,
  BuildWidgetResult,
  BuildWidgetSuccess,
} from './buildWidget.js';
export {buildWidget, hasBuiltSource} from './buildWidget.js';
export type {
  WidgetArtifact,
} from './buildCatalog.js';
export {
  buildCatalog,
  computeWidgetArtifact,
  listWidgetSlugs,
  DIST_DIR,
  PACKAGE_ROOT,
  WIDGETS_DIR,
} from './buildCatalog.js';
export {checkWidgetDocument, MAX_WIDGET_DOC_BYTES} from './contractGates.js';
export {hashWidgetDoc, hashWidgetSource} from './hash.js';
export type {
  WidgetGateResult,
  WidgetManifest,
  WidgetToolchain,
} from './manifest.js';
export {
  WidgetGateResultSchema,
  WidgetManifestSchema,
  WidgetToolchainSchema,
} from './manifest.js';
