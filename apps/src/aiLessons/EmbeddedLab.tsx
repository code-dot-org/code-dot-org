// Renders the lab area for a checkpoint by mounting the real Lab2 React
// view directly (no iframes).  We synthesize a `levelProperties` object per
// lab type and inject it as a prop, sidestepping the normal
// rails-served-app_options + server-fetched-level-properties path.
//
// Lab2 views read from the global Redux store (lab2Project, lab2System,
// progress, lab, etc.); StudentPage wraps us in <Provider store={getStore()}>
// at the entry-point level, and the code-studio/redux module is imported
// there for its reducer-registration side effects.
//
// We also dispatch a synthetic owner channel on every lab mount; without it
// isReadOnlyWorkspace() returns true and Music Lab renders without its
// toolbox.

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import React, {Suspense, useEffect, useMemo, useState} from 'react';

import {onLevelChange, setChannel} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {AppName, Channel, LabProps, ProjectSources} from '@cdo/apps/lab2/types';
import DialogManager from '@cdo/apps/lab2/views/dialogs/DialogManager';
import {MusicEntryPoint} from '@cdo/apps/music/entrypoint';
import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel} from '@cdo/apps/panels/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {Weblab2EntryPoint} from '@cdo/apps/weblab2/entrypoint';

import {
  AiLessonsProjectManager,
  loadSavedSources,
} from './aiLessonsProjectManager';
import {Checkpoint, LabType} from './types';

import styles from './aiLessons.module.scss';

// First (preferred) theme for each lab type, mirroring `themes[0]` in
// lab2EntryPoints.ts.  Hardcoded here so we don't have to import the whole
// entrypoints map just to read a string.
const LAB_DEFAULT_THEME: Record<string, 'Light' | 'Dark'> = {
  music: 'Dark',
  weblab2: 'Dark',
  panels: 'Light',
};

interface EmbeddedLabProps {
  checkpoint: Checkpoint;
  // The lesson this checkpoint belongs to.  Used as the storage scope for
  // saved project sources — all checkpoints in the same lesson that target
  // the same lab type share one project, so the student's code carries
  // across checkpoints.
  lessonId: string;
  // Called when an in-app navigation action signals the student has
  // finished the lab portion of the checkpoint — currently only the
  // Continue button on the last panel of a Panels checkpoint.
  onLabComplete?: () => void;
  // Fires when the student presses Run/Play inside the embedded lab.
  // Forwarded to the lab view via ExtraLabProps.
  onRun?: () => void;
}

// Stable synthetic level IDs per (lesson, lab type).  All checkpoints in
// the same lesson sharing a lab type get the same level ID so lab2's
// useSource() doesn't reset the workspace on checkpoint switch.  Weblab2
// gates rendering on `state.lab2Project.projectSourceLevelId ===
// levelProperties.id`, so the ID must be deterministic.
function synthesizeLevelId(lessonId: string, labType: string): number {
  const key = `${lessonId}::${labType}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function syntheticChannel(
  lessonId: string,
  labType: LabType,
  projectType: AppName,
  checkpointTitle: string
): Channel {
  const now = new Date().toISOString();
  return {
    id: `ai-lesson-${lessonId}-${labType}`,
    name: `AI Lesson ${labType} project (${checkpointTitle})`,
    isOwner: true,
    projectType,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

function defaultWeblab2Sources(): ProjectSources {
  return {
    source: {
      folders: {},
      files: {
        '1': {
          id: '1',
          name: 'index.html',
          contents: `<!DOCTYPE html>
<html>
  <head><title>My page</title></head>
  <body>
    <h1>Hello!</h1>
    <p>Edit this page on the left.</p>
  </body>
</html>
`,
          active: true,
          folderId: '0',
        },
        '2': {
          id: '2',
          name: 'style.css',
          contents: `body { font-family: sans-serif; padding: 24px; }
`,
          active: false,
          folderId: '0',
        },
      },
      openFiles: ['1'],
    },
  };
}

interface SlideInput {
  caption: string;
  imageUrl?: string;
}

function slidesToPanels(slides: SlideInput[]): Panel[] {
  return slides.map((s, i) => ({
    imageUrl: s.imageUrl || '',
    text: s.caption,
    key: `panel-${i}`,
  }));
}

const PanelsCheckpointLab: React.FC<{
  checkpoint: Checkpoint;
  lessonId: string;
  onLabComplete?: () => void;
}> = ({checkpoint, lessonId, onLabComplete}) => {
  // Always render the real PanelsView.  If the AI didn't generate explicit
  // slide captions for this checkpoint, fall back to a single panel built
  // from the instruction text so the student still gets the same Continue
  // affordance.
  const panels = useMemo(() => {
    const explicit = (checkpoint.panels ?? [])
      .map(p => ({caption: p.caption.trim(), imageUrl: p.imageUrl}))
      .filter(p => p.caption.length > 0);
    if (explicit.length > 0) return slidesToPanels(explicit);
    return slidesToPanels([{caption: checkpoint.title}]);
  }, [checkpoint]);

  return (
    <div className={styles.panelsView}>
      <PanelsView
        panels={panels}
        onContinue={() => onLabComplete?.()}
        targetWidth={Math.min(window.innerWidth - 420, 1100)}
        targetHeight={window.innerHeight - 80}
        offerBrowserTts={false}
        levelId={String(synthesizeLevelId(lessonId, 'panels'))}
      />
    </div>
  );
};

// Pushes a synthetic owner-channel + level metadata into the global lab
// redux state so isReadOnlyWorkspace() returns false and lab views that
// expect this state (Music's Blockly toolbox in particular) render fully.
// Also applies the lab's preferred theme — Music ships Dark-only, Panels
// is Light-first, Weblab2 starts Dark.
function useLabSetup(
  lessonId: string,
  labType: LabType,
  checkpoint: Checkpoint,
  appName: AppName,
  levelProperties: LabProps['levelProperties'],
  initialSources?: ProjectSources
): ProjectManager | undefined {
  const dispatch = useAppDispatch();
  const {setTheme} = useTheme();
  const [manager, setManager] = useState<ProjectManager>();

  useEffect(() => {
    const channel = syntheticChannel(
      lessonId,
      labType,
      appName,
      checkpoint.title
    );
    dispatch(setChannel(channel));
    dispatch(
      onLevelChange({
        channel,
        levelProperties,
        initialSources,
      })
    );

    // Build a custom ProjectManager so lab2 view saves (Weblab2's
    // setAndSaveProjectSources thunk, MusicView's saveCode) persist to
    // our per-(lesson, labType) source storage.  All checkpoints sharing
    // a lab type within a lesson write to the same file.
    const m = new AiLessonsProjectManager(lessonId, labType);
    if (initialSources) {
      m.setLastSource(initialSources);
    }
    // Music reads the ProjectManager from the `projectManager` prop
    // (ExtraLabProps); weblab2 still goes through the singleton, so for
    // those labs install on the registry too. The cast is needed because
    // the Lab2Registry typing wants the full ProjectManager class but
    // our shim only implements the surface (save + setLastSource) that
    // lab2 callers actually use.
    const asPM = m as unknown as ProjectManager;
    if (labType !== 'music') {
      Lab2Registry.getInstance().setProjectManager(asPM);
    }
    setManager(asPM);

    const theme = LAB_DEFAULT_THEME[appName] || 'Light';
    setTheme(theme);
    const lower = theme.toLowerCase();
    const opposite = lower === 'light' ? 'dark' : 'light';
    document.body.classList.remove(`background-${opposite}`);
    document.body.classList.add(`background-${lower}`);
    document.documentElement.setAttribute('data-theme', theme);

    return () => {
      // Force-flush any pending save before leaving this lab type.
      m.destroy();
    };
  }, [
    dispatch,
    lessonId,
    labType,
    checkpoint,
    appName,
    levelProperties,
    initialSources,
    setTheme,
  ]);

  return manager;
}

const Lab2MountedView: React.FC<{
  lessonId: string;
  labType: LabType;
  checkpoint: Checkpoint;
  appName: AppName;
  view: React.LazyExoticComponent<React.ComponentType<LabProps>>;
  levelProperties: LabProps['levelProperties'];
  initialSources?: ProjectSources;
  onRun?: () => void;
}> = ({
  lessonId,
  labType,
  checkpoint,
  appName,
  view: LabView,
  levelProperties,
  initialSources,
  onRun,
}) => {
  const projectManager = useLabSetup(
    lessonId,
    labType,
    checkpoint,
    appName,
    levelProperties,
    initialSources
  );

  return (
    <div
      id={`lab2-${appName}`}
      className={styles.labArea}
      style={{width: '100%', height: '100%'}}
    >
      <Suspense fallback={<div className={styles.labMessage}>Loading…</div>}>
        {/* DialogManager provides the dialog control context that
            lab2 surfaces (Music's Start Over confirmation, the lab2
            Skip dialog, etc.) expect.  Without it, `useDialogControl()`
            falls back to a no-op default and dialogs silently fail to
            open / re-open after dismissal. */}
        <DialogManager>
          <LabView
            levelProperties={levelProperties}
            initialSources={initialSources}
            hideResourcePanel={true}
            projectManager={projectManager}
            onRun={onRun}
          />
        </DialogManager>
      </Suspense>
    </div>
  );
};

// Music Lab's Blockly workspace needs a "when run" trigger as its root
// block — without it the project loads empty and the student has nothing
// to attach sounds to.  We also have to declare a sound library;
// "launch2024" is the canonical default.
const MUSIC_START_SOURCES = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run_simple2',
        id: 'when_run_simple2',
        x: 30,
        y: 30,
        deletable: false,
        movable: false,
      },
    ],
  },
};

const EmbeddedLab: React.FunctionComponent<EmbeddedLabProps> = ({
  checkpoint,
  lessonId,
  onLabComplete,
  onRun,
}) => {
  const labType = checkpoint.labType as LabType;
  const id = synthesizeLevelId(lessonId, labType);

  // Sources start undefined until we either confirm there's nothing saved
  // on the server or get back what was previously saved.  We re-fetch
  // whenever the lab type changes (panels → weblab2 → music, etc.) so
  // each lab type gets its own carry-over.
  const [savedSources, setSavedSources] = useState<ProjectSources | undefined>(
    undefined
  );
  const [sourcesLoading, setSourcesLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setSourcesLoading(true);
    (async () => {
      if (labType === 'panels') {
        if (!cancelled) {
          setSavedSources(undefined);
          setSourcesLoading(false);
        }
        return;
      }
      const loaded = await loadSavedSources(lessonId, labType);
      if (cancelled) return;
      setSavedSources(loaded);
      setSourcesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, labType]);

  // IMPORTANT: memoize levelProperties + initialSources so their object
  // identity doesn't change every render.  Without this, `useLabSetup`'s
  // effect would dispatch Redux state on every render and we'd loop.
  // Note: we deliberately omit `longInstructions` — the AI Tutor is the
  // sole voice on this surface; the lab's own instruction UI is hidden.
  const levelProperties = useMemo(() => {
    if (labType === 'weblab2') {
      return {
        id,
        name: `ai-lesson-${lessonId}-weblab2`,
        appName: 'weblab2' as AppName,
        isProjectLevel: true,
        usesProjects: true,
      };
    }
    if (labType === 'music') {
      return {
        id,
        name: `ai-lesson-${lessonId}-music`,
        appName: 'music' as AppName,
        isProjectLevel: true,
        usesProjects: true,
        levelData: {
          startSources: MUSIC_START_SOURCES,
          library: 'launch2024',
        },
      };
    }
    return undefined;
  }, [labType, id, lessonId]);

  // Prefer the server's saved sources if present; otherwise fall back to
  // the lab-type-specific defaults for first-time mount.
  const initialSources = useMemo(() => {
    if (labType === 'weblab2') {
      return savedSources ?? defaultWeblab2Sources();
    }
    if (labType === 'music') {
      return savedSources;
    }
    return undefined;
  }, [labType, savedSources]);

  if (labType === 'panels') {
    return (
      <PanelsCheckpointLab
        checkpoint={checkpoint}
        lessonId={lessonId}
        onLabComplete={onLabComplete}
      />
    );
  }

  if (sourcesLoading) {
    return <div className={styles.labMessage}>Loading your project…</div>;
  }

  if (labType === 'weblab2' && levelProperties) {
    return (
      <Lab2MountedView
        lessonId={lessonId}
        labType="weblab2"
        checkpoint={checkpoint}
        appName="weblab2"
        view={Weblab2EntryPoint.view}
        levelProperties={levelProperties}
        initialSources={initialSources}
        onRun={onRun}
      />
    );
  }

  if (labType === 'music' && levelProperties) {
    return (
      <Lab2MountedView
        lessonId={lessonId}
        labType="music"
        checkpoint={checkpoint}
        appName="music"
        view={MusicEntryPoint.view}
        levelProperties={levelProperties}
        initialSources={initialSources}
        onRun={onRun}
      />
    );
  }

  return (
    <div className={styles.labMessage}>
      Unknown lab type: {checkpoint.labType}
    </div>
  );
};

export default EmbeddedLab;
