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
import React, {Suspense, useEffect, useMemo} from 'react';

import {onLevelChange, setChannel} from '@cdo/apps/lab2/lab2Redux';
import {setIsStandaloneCollapsed} from '@cdo/apps/lab2/redux/lab2ViewRedux';
import {AppName, Channel, LabProps, ProjectSources} from '@cdo/apps/lab2/types';
import {NullRubricProvider} from '@cdo/apps/lab2/views/components/rubrics/RubricWrapper';
import {ExtraLinksButtonContext} from '@cdo/apps/lab2/views/LabViewsRenderer';
import {MusicEntryPoint} from '@cdo/apps/music/entrypoint';
import PanelsView from '@cdo/apps/panels/PanelsView';
import {Panel} from '@cdo/apps/panels/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {Weblab2EntryPoint} from '@cdo/apps/weblab2/entrypoint';

// First (preferred) theme for each lab type, mirroring `themes[0]` in
// lab2EntryPoints.ts.  Hardcoded here so we don't have to import the whole
// entrypoints map just to read a string.
const LAB_DEFAULT_THEME: Record<string, 'Light' | 'Dark'> = {
  music: 'Dark',
  weblab2: 'Dark',
  panels: 'Light',
};

import {Checkpoint, LabType} from './types';

import styles from './aiLessons.module.scss';

interface EmbeddedLabProps {
  checkpoint: Checkpoint;
  // Called when an in-app navigation action signals the student has
  // finished the lab portion of the checkpoint — currently only the
  // Continue button on the last panel of a Panels checkpoint.
  onLabComplete?: () => void;
}

// Stable synthetic level IDs per checkpoint.  The Weblab2 view in particular
// gates rendering on `state.lab2Project.projectSourceLevelId ===
// levelProperties.id`, so the ID must be deterministic per checkpoint.
function synthesizeLevelId(checkpointId: string): number {
  let hash = 0;
  for (let i = 0; i < checkpointId.length; i++) {
    hash = (hash * 31 + checkpointId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function syntheticChannel(
  checkpoint: Checkpoint,
  projectType: AppName
): Channel {
  const now = new Date().toISOString();
  return {
    id: `ai-lesson-${checkpoint.id}`,
    name: `AI Lesson Checkpoint: ${checkpoint.title}`,
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

function captionsToPanels(captions: string[]): Panel[] {
  return captions.map((caption, i) => ({
    imageUrl: '',
    text: caption,
    key: `panel-${i}`,
  }));
}

const PanelsCheckpointLab: React.FC<{
  checkpoint: Checkpoint;
  onLabComplete?: () => void;
}> = ({checkpoint, onLabComplete}) => {
  // Always render the real PanelsView.  If the AI didn't generate explicit
  // slide captions for this checkpoint, fall back to a single panel built
  // from the instruction text so the student still gets the same Continue
  // affordance.
  const panels = useMemo(() => {
    const explicit = (checkpoint.panels ?? [])
      .map(p => p.caption.trim())
      .filter(Boolean);
    if (explicit.length > 0) return captionsToPanels(explicit);
    return captionsToPanels([
      checkpoint.instructions || checkpoint.description || checkpoint.title,
    ]);
  }, [checkpoint]);

  return (
    <div className={styles.panelsView}>
      <PanelsView
        panels={panels}
        onContinue={() => onLabComplete?.()}
        targetWidth={Math.min(window.innerWidth - 420, 1100)}
        targetHeight={window.innerHeight - 80}
        offerBrowserTts={false}
        levelId={String(synthesizeLevelId(checkpoint.id))}
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
  checkpoint: Checkpoint,
  appName: AppName,
  levelProperties: LabProps['levelProperties'],
  initialSources?: ProjectSources
) {
  const dispatch = useAppDispatch();
  const {setTheme} = useTheme();

  useEffect(() => {
    const channel = syntheticChannel(checkpoint, appName);
    dispatch(setChannel(channel));
    dispatch(
      onLevelChange({
        channel,
        levelProperties,
        initialSources,
      })
    );
    // Force the lab's ResourcePanel into its collapsed sidebar state so the
    // AI Tutor owns the instruction/help affordance.  The student can still
    // expand it manually if they want lab settings or version history.
    dispatch(setIsStandaloneCollapsed(true));

    const theme = LAB_DEFAULT_THEME[appName] || 'Light';
    setTheme(theme);
    const lower = theme.toLowerCase();
    const opposite = lower === 'light' ? 'dark' : 'light';
    document.body.classList.remove(`background-${opposite}`);
    document.body.classList.add(`background-${lower}`);
    document.documentElement.setAttribute('data-theme', theme);
  }, [
    dispatch,
    checkpoint,
    appName,
    levelProperties,
    initialSources,
    setTheme,
  ]);
}

const Lab2MountedView: React.FC<{
  checkpoint: Checkpoint;
  appName: AppName;
  view: React.LazyExoticComponent<React.ComponentType<LabProps>>;
  levelProperties: LabProps['levelProperties'];
  initialSources?: ProjectSources;
}> = ({
  checkpoint,
  appName,
  view: LabView,
  levelProperties,
  initialSources,
}) => {
  useLabSetup(checkpoint, appName, levelProperties, initialSources);

  return (
    <div
      id={`lab2-${appName}`}
      className={styles.labArea}
      style={{width: '100%', height: '100%'}}
    >
      <Suspense fallback={<div className={styles.labMessage}>Loading…</div>}>
        <ExtraLinksButtonContext.Provider
          value={{setShowExtraLinksButton: () => {}}}
        >
          <NullRubricProvider>
            <LabView
              levelProperties={levelProperties}
              initialSources={initialSources}
            />
          </NullRubricProvider>
        </ExtraLinksButtonContext.Provider>
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
  onLabComplete,
}) => {
  const id = synthesizeLevelId(checkpoint.id);
  const labType = checkpoint.labType as LabType;

  // IMPORTANT: memoize levelProperties + initialSources so their object
  // identity doesn't change every render.  Without this, `useLabSetup`'s
  // effect would dispatch Redux state on every render and we'd loop.
  const levelProperties = useMemo(() => {
    if (labType === 'weblab2') {
      return {
        id,
        name: `ai-lesson-${checkpoint.id}`,
        appName: 'weblab2' as AppName,
        isProjectLevel: true,
        longInstructions: checkpoint.instructions,
        usesProjects: true,
      };
    }
    if (labType === 'music') {
      return {
        id,
        name: `ai-lesson-${checkpoint.id}`,
        appName: 'music' as AppName,
        isProjectLevel: true,
        longInstructions: checkpoint.instructions,
        usesProjects: true,
        levelData: {
          startSources: MUSIC_START_SOURCES,
          library: 'launch2024',
        },
      };
    }
    return undefined;
  }, [labType, id, checkpoint.id, checkpoint.instructions]);

  const initialSources = useMemo(() => {
    if (labType === 'weblab2') return defaultWeblab2Sources();
    return undefined;
  }, [labType]);

  if (labType === 'panels') {
    return (
      <PanelsCheckpointLab
        checkpoint={checkpoint}
        onLabComplete={onLabComplete}
      />
    );
  }

  if (labType === 'weblab2' && levelProperties) {
    return (
      <Lab2MountedView
        checkpoint={checkpoint}
        appName="weblab2"
        view={Weblab2EntryPoint.view}
        levelProperties={levelProperties}
        initialSources={initialSources}
      />
    );
  }

  if (labType === 'music' && levelProperties) {
    return (
      <Lab2MountedView
        checkpoint={checkpoint}
        appName="music"
        view={MusicEntryPoint.view}
        levelProperties={levelProperties}
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
