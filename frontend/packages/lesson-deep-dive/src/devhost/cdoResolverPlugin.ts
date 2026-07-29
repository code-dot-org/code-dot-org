// Vite plugin that resolves @cdo/* imports for the standalone dev host and
// Vitest. Every entry redirects to a real file:
//
//   - repo files whose own imports are all resolvable here (dependency-free
//     constants, feature-owned leaves, static fixtures), or
//   - per-module shims in ./modules that re-export the dev-host stubs with
//     the same default/named export shape the host module has.
//
// tsconfig.app.json "paths" points at the same files, so runtime resolution
// and typechecking agree. In build (library) mode this plugin is not applied;
// @cdo/* stays external and the Studio host resolves it.
//
// Exception: the sketchlab whiteboard canvas entries below are served from
// apps/ at runtime but stay pointed at the devhost contract stubs in
// tsconfig.app.json, so tsc never crawls into apps/src/sketchlab.

import path from 'node:path';
import type {Plugin} from 'vite';

const devhostDir = path.dirname(new URL(import.meta.url).pathname);
const pkgRoot = path.resolve(devhostDir, '..', '..');
const repoRoot = path.resolve(pkgRoot, '..', '..', '..');

const apps = (p: string) => path.resolve(repoRoot, 'apps', p);
const stub = (p: string) => path.resolve(devhostDir, 'modules', p);

const FILE_MAP: Record<string, string> = {
  // -- Real repo files that resolve cleanly (no further @cdo/apps deps) ------
  '@cdo/generated-scripts/sharedConstants': apps(
    'generated-scripts/sharedConstants.ts',
  ),
  '@cdo/apps/aiComponentLibrary/chatMessage/types': apps(
    'src/aiComponentLibrary/chatMessage/types.ts',
  ),
  // reflectionsApi's only import is AuthenticityTokenStore, mapped below.
  '@cdo/apps/aiTutor/reflectionsApi': apps('src/aiTutor/reflectionsApi.ts'),
  // Static practice-problem fixtures shipped with the feature.
  '@cdo/static/tutor/match_example.json': apps(
    'static/tutor/match_example.json',
  ),
  '@cdo/static/tutor/multiple_choice_example.json': apps(
    'static/tutor/multiple_choice_example.json',
  ),
  '@cdo/static/tutor/multiple_choice_multi_select.json': apps(
    'static/tutor/multiple_choice_multi_select.json',
  ),
  '@cdo/static/tutor/scramble_example.json': apps(
    'static/tutor/scramble_example.json',
  ),
  '@cdo/static/tutor/sort_example.json': apps('static/tutor/sort_example.json'),
  // The package's own types file: sources still import it by @cdo path so the
  // move stays byte-identical; resolve to the local copy.
  '@cdo/apps/aiTutor/views/lessonDeepDive/types': path.resolve(
    pkgRoot,
    'src',
    'lessonDeepDive',
    'types.ts',
  ),

  // -- Real sketchlab whiteboard canvas --------------------------------------
  // The canvas and its snapshot util are served from apps/ so the dev host
  // draws on the real ReactFlow surface. Relative imports inside these files
  // resolve naturally; the entries below cover the ones written as @cdo paths.
  '@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas': apps(
    'src/sketchlab/reactFlow/components/ReactFlowCanvas.tsx',
  ),
  '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob': apps(
    'src/sketchlab/reactFlow/utils/createSketchSnapshotBlob.ts',
  ),
  '@cdo/apps/sketchlab/reactFlow/constants': apps(
    'src/sketchlab/reactFlow/constants.ts',
  ),
  '@cdo/apps/sketchlab/reactFlow/context': apps(
    'src/sketchlab/reactFlow/context.ts',
  ),
  '@cdo/apps/sketchlab/reactFlow/reactFlowSelectors': apps(
    'src/sketchlab/reactFlow/reactFlowSelectors.ts',
  ),
  '@cdo/apps/sketchlab/reactFlow/hooks/useLineToolbar': apps(
    'src/sketchlab/reactFlow/hooks/useLineToolbar.ts',
  ),
  '@cdo/apps/sketchlab/reactFlow/utils/stacking': apps(
    'src/sketchlab/reactFlow/utils/stacking.ts',
  ),
  // Leaves the canvas closure pulls in; each imports nothing but react (or,
  // for activeTourTracker, a type-only shepherd.js import).
  '@cdo/apps/util/isTargetEditable': apps('src/util/isTargetEditable.ts'),
  '@cdo/apps/util/hooks/useHiddenFileInput': apps(
    'src/util/hooks/useHiddenFileInput.tsx',
  ),
  '@cdo/apps/sharedComponents/productTour/activeTourTracker': apps(
    'src/sharedComponents/productTour/activeTourTracker.ts',
  ),
  // lab2 seams the canvas reaches for. The whiteboard drives the canvas
  // through the updateSources prop, so the sources context is inert here, and
  // the dev host is never in levelbuilder start/exemplar mode.
  '@cdo/apps/lab2/views/SourcesContainer': stub('sourcesContainer.ts'),
  '@cdo/apps/lab2/projects/utils': stub('lab2ProjectUtils.ts'),

  // -- Utility stubs ---------------------------------------------------------
  '@cdo/apps/util/HttpClient': stub('httpClient.ts'),
  '@cdo/apps/util/experiments': stub('experiments.ts'),
  '@cdo/apps/util/reduxHooks': stub('reduxHooks.ts'),
  '@cdo/apps/utils': stub('utils.ts'),
  '@cdo/apps/util/AuthenticityTokenStore': stub('authenticityTokenStore.ts'),
  '@cdo/apps/metrics/AnalyticsReporter': stub('analyticsReporter.ts'),
  '@cdo/apps/metrics/AnalyticsConstants': stub('analyticsConstants.ts'),

  // -- AI seams: canned local behavior ---------------------------------------
  '@cdo/apps/aiTutor/hooks/useAiTutorModelParameters': stub(
    'useAiTutorModelParameters.ts',
  ),
  '@cdo/apps/aichat/aichatApi': stub('aichatApi.ts'),

  // -- Type-only modules (imports erased at runtime; mapped so Vitest/Vite
  // resolution never falls through to apps/) --------------------------------
  '@cdo/apps/sketchlab/reactFlow/types': path.resolve(
    devhostDir,
    'hostTypes.ts',
  ),
  '@cdo/apps/lab2/types': path.resolve(devhostDir, 'hostTypes.ts'),
  '@cdo/apps/aichat/types': path.resolve(devhostDir, 'hostTypes.ts'),

  // -- Component stubs -------------------------------------------------------
  '@cdo/apps/templates/SafeMarkdown': stub('safeMarkdown.ts'),
  '@cdo/apps/aichat/views/WaitingAnimation': stub('waitingAnimation.ts'),
  '@cdo/apps/lab2/views/components/AiTutorChat': stub('aiTutorChat.ts'),
  '@cdo/apps/jsonVideo/TutorVideo': stub('tutorVideo.ts'),
  '@cdo/apps/codebridge/FileBrowser/Droppable': stub('droppable.ts'),
};

export function cdoResolverPlugin(): Plugin {
  return {
    name: 'cdo-stub-resolver',
    enforce: 'pre',
    resolveId(source) {
      return FILE_MAP[source] ?? null;
    },
  };
}
