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

import React, {Suspense, useEffect, useMemo, useRef, useState} from 'react';

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
  projectSourcesFromFiles,
  saveSources,
  sourceScopeFor,
} from './aiLessonsProjectManager';
import {generateProjectFiles} from './buildPartner';
import {StudentInputs} from './studentInputs';
import {
  isLabStep,
  LabStep,
  LessonPlan,
  PanelsStep,
  ProjectLabType,
  Step,
} from './types';

import styles from './aiLessons.module.scss';

// Labs used to force their preferred theme (music/panels/weblab2 → Dark)
// per-mount here.  That moved to the demo settings panel: labs now follow
// whatever theme the presenter picked (see demoSettings.ts).

interface EmbeddedLabProps {
  step: Step;
  // The lesson this step belongs to.  Its id scopes saved project
  // sources — all non-sandbox lab steps in the same lesson that target
  // the same lab type share one project, so the student's code carries
  // across steps.  The full plan and the student's recorded answers
  // feed starter-code generation on first arrival.
  lesson: LessonPlan;
  lessonId: string;
  inputs: StudentInputs;
  // Called when an in-app navigation action signals the student has
  // finished the main-area portion of the step — currently the Continue
  // button on the last panel of a panels step.
  onLabComplete?: () => void;
  // Fires when the student presses Run/Play inside the embedded lab.
  // Forwarded to the lab view via ExtraLabProps.
  onRun?: () => void;
  // Reports whether the slow AI starter-code generation is running, so
  // the page can gate Continue on the work actually existing.
  onGeneratingChange?: (generating: boolean) => void;
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
  labType: ProjectLabType,
  projectType: AppName,
  checkpointTitle: string,
  frozen: boolean
): Channel {
  const now = new Date().toISOString();
  return {
    id: `ai-lesson-${lessonId}-${labType}`,
    name: `AI Lesson ${labType} project (${checkpointTitle})`,
    isOwner: true,
    // A frozen channel is lab2's permanent read-only state — codebridge's
    // editor and file browser honor it.  Set for `readOnly` steps
    // (AI showcases: look, don't touch).
    frozen,
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
  <head>
    <title>My page</title>
    <link rel="stylesheet" href="style.css">
  </head>
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
  step: PanelsStep;
  lessonId: string;
  onLabComplete?: () => void;
}> = ({step, lessonId, onLabComplete}) => {
  // Always render the real PanelsView.  If the step has no usable slide
  // captions, fall back to a single panel built from the title so the
  // student still gets the same Continue affordance.
  const panels = useMemo(() => {
    const explicit = (step.panels ?? [])
      .map(p => ({caption: p.caption.trim(), imageUrl: p.imageUrl}))
      .filter(p => p.caption.length > 0);
    if (explicit.length > 0) return slidesToPanels(explicit);
    return slidesToPanels([{caption: step.title}]);
  }, [step]);

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
// redux state so isReadOnlyWorkspace() returns false (or true, via the
// frozen flag, on `readOnly` showcase steps) and lab views that
// expect this state (Music's Blockly toolbox in particular) render fully.
// Also applies the lab's preferred theme — Music ships Dark-only, Panels
// is Light-first, Weblab2 starts Dark.
function useLabSetup(
  lessonId: string,
  labType: ProjectLabType,
  scope: string,
  checkpoint: LabStep,
  appName: AppName,
  levelProperties: LabProps['levelProperties'],
  initialSources?: ProjectSources
): ProjectManager | undefined {
  const dispatch = useAppDispatch();
  const [manager, setManager] = useState<ProjectManager>();

  useEffect(() => {
    const channel = syntheticChannel(
      lessonId,
      labType,
      appName,
      checkpoint.title,
      !!checkpoint.readOnly
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
    // our per-(lesson, scope) source storage.  Steps sharing a scope
    // (the lesson project, or one sandbox segment) write to one file.
    const m = new AiLessonsProjectManager(lessonId, scope);
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

    return () => {
      // Force-flush any pending save before leaving this lab type.
      m.destroy();
    };
  }, [
    dispatch,
    lessonId,
    labType,
    scope,
    checkpoint,
    appName,
    levelProperties,
    initialSources,
  ]);

  return manager;
}

const Lab2MountedView: React.FC<{
  lessonId: string;
  labType: ProjectLabType;
  scope: string;
  checkpoint: LabStep;
  appName: AppName;
  view: React.LazyExoticComponent<React.ComponentType<LabProps>>;
  levelProperties: LabProps['levelProperties'];
  initialSources?: ProjectSources;
  onRun?: () => void;
}> = ({
  lessonId,
  labType,
  scope,
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
    scope,
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
  step,
  lesson,
  lessonId,
  inputs,
  onLabComplete,
  onRun,
  onGeneratingChange,
}) => {
  const labType = step.kind === 'lab' ? step.labType : undefined;
  // One saved source per scope: the lab type for the shared project,
  // or a sandbox slug for isolated skill practice.  Level id + channel
  // follow the scope so lab2 treats each sandbox as its own workspace.
  const scope = step.kind === 'lab' ? sourceScopeFor(step) : step.kind;
  const id = synthesizeLevelId(lessonId, scope);

  // Sources start undefined until first-arrival resolution finishes:
  // saved source wins, then authored starterFiles, then an AI-generated
  // starter (persisted so it happens once per student), then the lab
  // default.  `generating` distinguishes the slow AI path in the UI.
  const [savedSources, setSavedSources] = useState<ProjectSources | undefined>(
    undefined
  );
  const [sourcesLoading, setSourcesLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  // Read through refs at generation time: answers recorded while a lab
  // step is mounted (e.g. build-partner prompts) must not refire this
  // effect and clobber the live editor.
  const lessonRef = useRef(lesson);
  lessonRef.current = lesson;
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;
  const stepRef = useRef(step);
  stepRef.current = step;

  // Mirror `generating` up through a ref-read callback: the parent's
  // handler must not join the sources effect's dependencies (a refire
  // would clobber the live editor).  Cleanup reports false so a step
  // switch mid-generation doesn't leave the page gated forever.
  const onGeneratingChangeRef = useRef(onGeneratingChange);
  onGeneratingChangeRef.current = onGeneratingChange;
  useEffect(() => {
    onGeneratingChangeRef.current?.(generating);
    return () => onGeneratingChangeRef.current?.(false);
  }, [generating]);

  useEffect(() => {
    let cancelled = false;
    setSourcesLoading(true);
    (async () => {
      if (!labType) {
        if (!cancelled) {
          setSavedSources(undefined);
          setSourcesLoading(false);
        }
        return;
      }
      const currentStep = stepRef.current as LabStep;
      let resolved = await loadSavedSources(lessonId, scope);
      if (cancelled) return;

      if (!resolved && currentStep.starterFiles) {
        resolved = projectSourcesFromFiles(currentStep.starterFiles);
      } else if (
        !resolved &&
        currentStep.starterPrompt &&
        labType === 'weblab2'
      ) {
        setGenerating(true);
        try {
          const built = await generateProjectFiles({
            lesson: lessonRef.current,
            step: currentStep,
            prompt: currentStep.starterPrompt,
            inputs: inputsRef.current,
          });
          resolved = built.sources;
          // Persist so generation happens once per student; a failure
          // here just means we regenerate next visit.
          await saveSources(lessonId, scope, built.sources).catch(e =>
            console.warn('Failed to persist generated starter', e)
          );
        } catch (e) {
          // Fall through to the lab default rather than dead-ending.
          console.warn('Starter generation failed', e);
        }
        if (cancelled) return;
        setGenerating(false);
      }

      setSavedSources(resolved);
      setSourcesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, scope, labType]);

  // IMPORTANT: memoize levelProperties + initialSources so their object
  // identity doesn't change every render.  Without this, `useLabSetup`'s
  // effect would dispatch Redux state on every render and we'd loop.
  // Note: we deliberately omit `longInstructions` — the AI Tutor is the
  // sole voice on this surface; the lab's own instruction UI is hidden.
  //
  // The step's authored levelProperties (a slice of the lab's own
  // LevelProperties schema — e.g. weblab2's initialViewMode) spreads
  // first, so the identity and project fields the player owns can't be
  // overridden by lesson content.  Stabilized by content, not object
  // identity: overlay merges rebuild step objects mid-step, and a
  // levelProperties identity change would re-dispatch the lab setup.
  const authoredPropsJson = JSON.stringify(
    (isLabStep(step) ? step.levelProperties : undefined) ?? null
  );
  const authoredProps = useMemo(
    () => JSON.parse(authoredPropsJson) ?? undefined,
    [authoredPropsJson]
  );
  const levelProperties = useMemo(() => {
    if (labType === 'weblab2') {
      return {
        ...authoredProps,
        id,
        name: `ai-lesson-${lessonId}-${scope}`,
        appName: 'weblab2' as AppName,
        isProjectLevel: true,
        usesProjects: true,
      };
    }
    if (labType === 'music') {
      return {
        ...authoredProps,
        id,
        name: `ai-lesson-${lessonId}-${scope}`,
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
  }, [labType, id, lessonId, scope, authoredProps]);

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

  if (step.kind === 'panels') {
    return (
      <PanelsCheckpointLab
        step={step}
        lessonId={lessonId}
        onLabComplete={onLabComplete}
      />
    );
  }

  if (step.kind === 'questions' || step.kind === 'hub') {
    // Questions and hub steps are rendered at the page level
    // (QuestionFlow / SkillHub), not through the lab mount.
    return null;
  }

  if (sourcesLoading) {
    return (
      <div className={styles.labMessage}>
        {generating
          ? 'Building your starter site from your answers…'
          : 'Loading your project…'}
      </div>
    );
  }

  if (labType === 'weblab2' && levelProperties) {
    return (
      <Lab2MountedView
        lessonId={lessonId}
        labType="weblab2"
        scope={scope}
        checkpoint={step}
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
        scope={scope}
        checkpoint={step}
        appName="music"
        view={MusicEntryPoint.view}
        levelProperties={levelProperties}
        initialSources={initialSources}
        onRun={onRun}
      />
    );
  }

  return <div className={styles.labMessage}>Unknown step kind</div>;
};

export default EmbeddedLab;
