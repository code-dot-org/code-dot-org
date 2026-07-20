import {useCallback, useEffect, useRef} from 'react';

import {
  useAppDispatch,
  useAppSelector,
  useCodebridgeSettings,
} from '@code-dot-org/codebridge';
import type {MultiFileSource, ProjectSources} from '@code-dot-org/core/api';
import {LifecycleEvent} from '@code-dot-org/lab';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';
import {useLifecycleNotifier, useThemeSetting} from '@code-dot-org/lab/hooks';
import {labProjectActions} from '@code-dot-org/lab/redux';
import ResourcePanel from '@code-dot-org/lab/resourcePanel';

/**
 * The left-hand instructions / resource panel, built on the base
 * `ResourcePanel` (the same component music lab uses). It renders the level's
 * `longInstructions`, version history, and lesson navigation, reading run state
 * from the base `labSystem` slice.
 *
 * PythonLayout only mounts inside `CodebridgeLab`, which renders its children
 * only once level properties resolve, so they are present here.
 */
const InstructionsPanel = ({className}: {className?: string}) => {
  const levelProperties = useMaybeLevelProperties();
  const isRunning = useAppSelector(state => state.labSystem.isRunning);
  const hasRun = useAppSelector(state => state.labSystem.hasRun);

  // The baseline the version panel restores as "Initial version": the project
  // as the host loaded it. Captured from the level-load event rather than at
  // first render — the lab mounts with its empty default project and the real
  // sources arrive asynchronously, so a render-time snapshot would be the
  // default. Later edits don't move it. A level's own start sources take
  // precedence when it has them (see below).
  const {currentSources, previewSources} = useSources<MultiFileSource>();
  const loadedSourcesRef = useRef<ProjectSources | undefined>(undefined);
  useLifecycleNotifier(
    LifecycleEvent.LevelLoadCompleted,
    useCallback(
      (
        _levelProperties?: unknown,
        _channel?: unknown,
        initialSources?: ProjectSources,
      ) => {
        loadedSourcesRef.current = initialSources;
      },
      [],
    ),
  );
  // Mirror the current sources into redux, and flag when they differ from the
  // project as loaded. Both feed the version panel's "save a named version"
  // flow: base `SaveVersionPanel` reads `labProject.projectSources` (legacy's
  // source of truth, which nothing else populates here, so it would no-op) and
  // only renders once `labProject.hasEdited` is true — there is nothing to name
  // until the student has changed something. This lab keeps sources in the
  // SourcesContext, so it has to publish both.
  const dispatch = useAppDispatch();
  const hasEdited = useAppSelector(state => state.labProject.hasEdited);
  useEffect(() => {
    dispatch(
      labProjectActions.setProjectSource(
        currentSources as unknown as ProjectSources,
      ),
    );
    // Compare against the loaded baseline rather than the previous value: the
    // sources arrive asynchronously after mount, and that first arrival is a
    // load, not an edit.
    const baseline = loadedSourcesRef.current;
    if (
      baseline &&
      JSON.stringify(currentSources.source) !==
        JSON.stringify((baseline as unknown as {source: unknown}).source)
    ) {
      dispatch(labProjectActions.setHasEdited(true));
    }
  }, [dispatch, currentSources]);

  // Codebridge contributes the editor/console font-size settings; Python Lab
  // supports both themes, so it also opts in to the theme toggle (its editor
  // carries a matching light and dark theme). Order matches legacy: font sizes,
  // then theme.
  const codebridgeSettings = useCodebridgeSettings();
  const themeSetting = useThemeSetting(['Light', 'Dark']);
  const settings = themeSetting
    ? [...codebridgeSettings, themeSetting]
    : codebridgeSettings;

  if (!levelProperties) {
    return null;
  }

  // Prefer the level's own start state (what Start Over resets to) when it has
  // one; otherwise fall back to the project as first loaded. The fallback is
  // what makes "Initial version" restore a project-level's actual opening
  // sources rather than the lab's empty default project.
  //
  // NOTE: level properties type these as a bare MultiFileSource, but the base
  // `getInitialSources` consumes them as ProjectSources (i.e. `{source}`), so
  // pass whichever shape they arrive in through unchanged.
  const levelStartSources =
    levelProperties.templateSources || levelProperties.startSources;
  const startSources = (levelStartSources ??
    loadedSourcesRef.current ??
    currentSources) as unknown as ProjectSources;

  return (
    <ResourcePanel
      className={className}
      levelProperties={levelProperties}
      isRunning={isRunning}
      hasRun={hasRun}
      hasEdited={hasEdited}
      documentationUrl="/docs/ide/python"
      settings={settings}
      // Enables the Version History tab (like music lab). Auto-save groups stay
      // collapsed by default (`alwaysShowAutoSaves` unset), so the named
      // versions a student saved are what the list leads with.
      // `onLoadVersion` is what actually swaps a previewed/restored version into
      // the editor: this lab's source of truth is the SourcesContext, not redux,
      // so the panel's sources have to be written back through it. It must use
      // `previewSources`, never `updateSources` — every version the panel hands
      // us already exists on the server, and saving it back would overwrite the
      // project with the version being *viewed* (the read-only flag is dispatched
      // in the same tick, so it can't be relied on to suppress that save).
      versionHistoryProps={{
        startSources,
        onLoadVersion: sources =>
          previewSources(sources as unknown as typeof currentSources),
      }}
    />
  );
};

export default InstructionsPanel;
