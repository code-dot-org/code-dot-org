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
  '@cdo/apps/sketchlab/reactFlow/utils/createSketchSnapshotBlob': stub(
    'createSketchSnapshotBlob.ts',
  ),

  // -- Type-only modules (imports erased at runtime; mapped so Vitest/Vite
  // resolution never falls through to apps/) --------------------------------
  '@cdo/apps/sketchlab/reactFlow/types': path.resolve(
    devhostDir,
    'hostTypes.ts',
  ),
  '@cdo/apps/aichat/types': path.resolve(devhostDir, 'hostTypes.ts'),

  // -- Component stubs -------------------------------------------------------
  '@cdo/apps/templates/SafeMarkdown': stub('safeMarkdown.ts'),
  '@cdo/apps/aichat/views/WaitingAnimation': stub('waitingAnimation.ts'),
  '@cdo/apps/lab2/views/components/AiTutorChat': stub('aiTutorChat.ts'),
  '@cdo/apps/jsonVideo/TutorVideo': stub('tutorVideo.ts'),
  '@cdo/apps/codebridge/FileBrowser/Droppable': stub('droppable.ts'),
  '@cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas':
    stub('reactFlowCanvas.ts'),
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
