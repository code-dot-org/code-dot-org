// Chooses which screen to show: the checkpoint map, one checkpoint's steps,
// or the project on its own. Owns the progress they share, and does what
// the pathway's finish block says when the student is finished.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {setAiGatewayOptIn} from '@cdo/apps/aichat/api/shouldUseAiGateway';
import {AichatContext} from '@cdo/apps/aichat/types';
import {
  sendAdaptiveStepReport,
  sendStartedReportIfNotStarted,
} from '@cdo/apps/code-studio/progressRedux';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {LevelProperties} from '@cdo/apps/lab2/types';
import TeacherViewingStudentProjectAlert from '@cdo/apps/lab2/views/alerts/teacherViewingStudentProject';
import Loading from '@cdo/apps/lab2/views/Loading';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {isAdaptiveAiEnabled} from '../ai/access';
import {
  sendAdaptiveEvent,
  sendFinalProjectClicked,
  setAdaptiveMetricsContext,
  statusCounts,
} from '../metricsHelpers';
import {
  PROJECT_STEP_ID,
  CheckpointStatus,
  Progress,
  isComplete,
  stepIdToResume,
  stepsCompleteShare,
  totalTimeSpent,
  useProgress,
  visibleSteps,
} from '../progress';
import {ProgressKey} from '../progress/progressStore';
import {
  checkpointsToFinish,
  finishLockMessage,
} from '../routing/checkpointsToFinish';
import {nextCheckpoint} from '../routing/route';
import {findCheckpoint} from '../schema/helpers';
import {Checkpoint, Pathway, Step} from '../types';

import AdaptiveHeader from './AdaptiveHeader';
import AdaptiveTabBar from './AdaptiveTabBar';
import {checkpointStepFromUrl, clearUrl} from './checkpointUrl';
import FinalProjectCallout from './FinalProjectCallout';
import FinishDialog from './FinishDialog';
import {getSkillProgress} from './map/groupProgress';
import MapScreen from './MapScreen';
import {PathwayContext} from './PathwayContext';
import StepPlayer from './steps/StepPlayer';
import useDismissed from './useDismissed';

import styles from './shared.module.scss';

type View =
  | {kind: 'map'; focusId?: string; focusNext?: boolean}
  | {kind: 'step'; checkpointId: string; stepId?: string}
  | {kind: 'project'};

interface PathwayAppProps {
  pathway: Pathway;
  progressKey: ProgressKey;
  /** The adaptive level's own properties, for the map's resource rail. */
  levelProperties: LevelProperties;
}

/**
 * The project as a one-step checkpoint, so the player can open it. The
 * template level is playable and its channel is the project itself; the
 * pathway's project brief stands in for the level's own instructions.
 */
function projectCheckpoint(pathway: Pathway): Checkpoint {
  return {
    id: 'project',
    title: 'My Project',
    description: pathway.project.description,
    steps: [
      {
        id: PROJECT_STEP_ID,
        title: 'Work on my Project',
        kind: 'level',
        level: pathway.project.templateLevel,
        project: true,
        instructions: pathway.project.description,
        levelProperties: pathway.project.levelProperties,
      },
    ],
  };
}

const PathwayApp: React.FunctionComponent<PathwayAppProps> = ({
  pathway,
  progressKey,
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  useEffect(
    () =>
      setAdaptiveMetricsContext({
        pathwayId: pathway.id,
        levelId: progressKey.levelId,
        scriptId: progressKey.scriptId,
      }),
    [pathway.id, progressKey.levelId, progressKey.scriptId]
  );
  const reportLevelStep = useCallback(
    (levelId: number, appType: string, result: number, timeMs: number) =>
      dispatch(sendAdaptiveStepReport(levelId, appType, result, timeMs)),
    [dispatch]
  );
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const {progress, statusMap, ...restProgress} = useProgress(
    pathway,
    progressKey,
    {
      reportLevelStep,
      viewAsUserId,
    }
  );
  if (!progress) {
    return (
      <div className={styles.app}>
        <Loading isLoading />
      </div>
    );
  }
  const {checkpointId: urlCheckpointId, stepId: urlStepId} =
    checkpointStepFromUrl();

  let initialCheckpointId: string | undefined;
  let initialStepId: string | undefined;
  let initialProject = false;
  // A step with generatedInstructions but no status doesn't count as started.
  // Only a checkpoint's steps count; time on the project screen does not.
  const hasProgress = pathway.checkpoints.some(c =>
    c.steps.some(s => progress.steps[s.id]?.status)
  );

  const finishLocked = (checkpointsToFinish(pathway, statusMap) ?? 0) > 0;
  if (urlCheckpointId === 'project') {
    // The project screen writes this; a teacher who picks another student
    // there stays on it, since the app remounts once their progress loads.
    initialProject = true;
  } else if (urlCheckpointId) {
    if (
      (statusMap[urlCheckpointId] === 'locked' ||
        (finishLocked && urlCheckpointId === pathway.finish?.checkpoint?.id)) &&
      !restProgress.isViewingStudent
    ) {
      // Silently drop the URL rather than let the student bypass a lock.
      clearUrl();
    } else {
      // URL names an accessible checkpoint: open it, using the URL step if valid.
      initialCheckpointId = urlCheckpointId;
      const cp = findCheckpoint(pathway, urlCheckpointId);
      if (cp) {
        const urlStepValid = cp.steps.some(s => s.id === urlStepId);
        initialStepId = urlStepValid ? urlStepId : stepIdToResume(cp, progress);
      }
    }
  } else {
    // No URL checkpoint: auto-start only when the student hasn't begun yet.
    if (!hasProgress) {
      const firstCp = pathway.checkpoints.find(
        c => statusMap[c.id] === 'available'
      );
      if (firstCp) {
        initialCheckpointId = firstCp.id;
        initialStepId = stepIdToResume(firstCp, progress);
      }
    }
  }

  return (
    <LoadedPathwayApp
      pathway={pathway}
      progressKey={progressKey}
      levelProperties={levelProperties}
      progress={progress}
      statusMap={statusMap}
      initialCheckpointId={initialCheckpointId}
      initialStepId={initialStepId}
      initialProject={initialProject}
      isFirstVisit={!hasProgress}
      {...restProgress}
    />
  );
};

/** What useProgress returns once the stored progress has loaded. */
type LoadedProgress = ReturnType<typeof useProgress> & {progress: Progress};

type LoadedPathwayAppProps = PathwayAppProps &
  LoadedProgress & {
    /** Checkpoint to open on mount; absent → show map. */
    initialCheckpointId?: string;
    /** Step within initialCheckpointId to start on. */
    initialStepId?: string;
    /** Open the project screen on mount, over any initial checkpoint. */
    initialProject?: boolean;
    isFirstVisit: boolean;
  };

const OPEN_EVENTS: {[status in CheckpointStatus]?: string} = {
  available: EVENTS.ADAPTIVE_CHECKPOINT_STARTED,
  inProgress: EVENTS.ADAPTIVE_CHECKPOINT_RESUMED,
  complete: EVENTS.ADAPTIVE_CHECKPOINT_REVIEWED,
  skipped: EVENTS.ADAPTIVE_SKIPPED_CHECKPOINT_OPENED,
};

// The pathway once its progress is known. Reads initialCheckpointId and
// initialStepId once, on mount.
const LoadedPathwayApp: React.FunctionComponent<LoadedPathwayAppProps> = ({
  pathway,
  progressKey,
  levelProperties,
  progress,
  statusMap,
  initialCheckpointId,
  initialStepId,
  initialProject = false,
  isFirstVisit,
  isViewingStudent,
  isReadonly,
  viewAsUserId,
  startStep,
  completeStep,
  leaveStep,
  saveGeneratedInstructions,
  recordValidation,
  evidence,
  saveAnswers,
}) => {
  const dispatch = useAppDispatch();
  const projectName = useAppSelector(
    state => state.lab.channel?.name || undefined
  );
  const stepShares = useMemo(
    () =>
      Object.fromEntries(
        pathway.checkpoints.map(c => [c.id, stepsCompleteShare(c, progress)])
      ),
    [pathway, progress]
  );
  const [view, setView] = useState<View>(
    initialProject
      ? {kind: 'project'}
      : initialCheckpointId
      ? {kind: 'step', checkpointId: initialCheckpointId, stepId: initialStepId}
      : {kind: 'map'}
  );
  const remainingToFinish = useMemo(
    () => checkpointsToFinish(pathway, statusMap),
    [pathway, statusMap]
  );
  const finishDisabledReason = remainingToFinish
    ? finishLockMessage(remainingToFinish)
    : undefined;
  const finishLocked = !!finishDisabledReason;

  const hasReportedInitialLoad = useRef(false);
  useEffect(() => {
    if (hasReportedInitialLoad.current) return;
    hasReportedInitialLoad.current = true;
    sendAdaptiveEvent(EVENTS.ADAPTIVE_PATHWAY_LOADED, {
      isFirstVisit,
      ...statusCounts(statusMap),
    });
  }, [isFirstVisit, statusMap]);

  const onMap = view.kind === 'map';
  useEffect(() => {
    if (onMap) sendAdaptiveEvent(EVENTS.ADAPTIVE_SKILL_MAP_VIEWED);
  }, [onMap]);

  // Reads the status at open, before the first step's start changes it.
  const openedId = view.kind === 'step' ? view.checkpointId : undefined;
  const lockedAtOpen = useRef<{id?: string; locked: boolean}>({locked: false});
  if (lockedAtOpen.current.id !== openedId) {
    lockedAtOpen.current = {
      id: openedId,
      locked:
        !!openedId &&
        (statusMap[openedId] === 'locked' ||
          (finishLocked && openedId === pathway.finish?.checkpoint?.id)),
    };
  }
  const lastOpenedId = useRef<string>();
  // A skip is credited to the checkpoint played last.
  const lastPlayedId = useRef<string>();
  useEffect(() => {
    if (openedId === lastOpenedId.current) return;
    lastOpenedId.current = openedId;
    if (!openedId) return;
    lastPlayedId.current = openedId;
    const status = statusMap[openedId];
    const event = OPEN_EVENTS[status];
    if (!event) return;
    const checkpoint = pathway.checkpoints.find(c => c.id === openedId);
    sendAdaptiveEvent(event, {
      checkpointId: openedId,
      checkpointStatus: status,
      wasSuggested: nextCheckpoint(pathway, statusMap) === openedId,
      requiresCount: checkpoint?.requires?.length ?? 0,
    });
  }, [openedId, pathway, statusMap]);

  // Skips come out of routing on any change to progress, so there is no one
  // action to send them from.
  const previousStatusMap = useRef(statusMap);
  useEffect(() => {
    const before = previousStatusMap.current;
    if (before === statusMap) return;
    previousStatusMap.current = statusMap;
    const newlySkipped = Object.keys(statusMap).filter(
      id => statusMap[id] === 'skipped' && before[id] !== 'skipped'
    );
    for (const id of newlySkipped) {
      const checkpoint = pathway.checkpoints.find(c => c.id === id);
      const skillIds = checkpoint?.skillIds ?? [];
      sendAdaptiveEvent(EVENTS.ADAPTIVE_ROUTING_SKIPPED_CHECKPOINT, {
        checkpointId: id,
        skillIds: skillIds.join(','),
        evidenceLevels: skillIds
          .map(s => `${s}:${evidence[s]?.evidenceLevel ?? 0}`)
          .join(','),
        triggeredByCheckpointId: lastPlayedId.current,
      });
    }
  }, [statusMap, pathway, evidence]);

  // Handle browser back/forward at the checkpoint level.
  useEffect(() => {
    const handler = () => {
      const {checkpointId, stepId: urlStep} = checkpointStepFromUrl();
      if (!checkpointId) {
        setView({kind: 'map'});
      } else if (checkpointId === 'project') {
        setView({kind: 'project'});
      } else if (
        (statusMap[checkpointId] === 'locked' ||
          (finishLocked && checkpointId === pathway.finish?.checkpoint?.id)) &&
        !isViewingStudent
      ) {
        clearUrl();
        setView({kind: 'map'});
      } else {
        const cp = findCheckpoint(pathway, checkpointId);
        const validUrlStep = cp?.steps.some(s => s.id === urlStep)
          ? urlStep
          : undefined;
        setView({
          kind: 'step',
          checkpointId,
          stepId:
            validUrlStep ?? (cp ? stepIdToResume(cp, progress) : undefined),
        });
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [pathway, progress, statusMap, finishLocked, isViewingStudent]);
  // After a routing checkpoint, zoom the map to the next suggested checkpoint.
  useEffect(() => {
    if (view.kind === 'map' && view.focusNext) {
      setView({kind: 'map', focusId: nextCheckpoint(pathway, statusMap)});
    }
  }, [view, pathway, statusMap]);
  // A teacher viewing a student would otherwise start the level as themselves.
  useEffect(() => {
    if (initialCheckpointId && !isReadonly)
      dispatch(sendStartedReportIfNotStarted('adaptive'));
  }, [initialCheckpointId, isReadonly, dispatch]);
  const project = useMemo(() => projectCheckpoint(pathway), [pathway]);
  const openProject = () => {
    if (!isReadonly) dispatch(sendStartedReportIfNotStarted('adaptive'));
    setView({kind: 'project'});
  };
  const allCheckpointsComplete = pathway.checkpoints.every(
    c => statusMap[c.id] === 'complete' || statusMap[c.id] === 'skipped'
  );
  // Each callout shows until dismissed, once per student, browser and pathway.
  const userId = useAppSelector(state => state.currentUser.userId);
  const [calloutDismissed, dismissCallout] = useDismissed(
    'project',
    userId,
    pathway.id
  );
  const [finishCalloutDismissed, dismissFinishCallout] = useDismissed(
    'finish',
    userId,
    pathway.id
  );
  // Shown once the lock lifts; the project callout waits its turn.
  const finishCallout =
    remainingToFinish === 0 && !finishCalloutDismissed
      ? {
          title: "You're ready to finish!",
          body: `You've completed enough checkpoints to wrap up. Click the "I'm finished" button when you're ready, or keep practicing skills first.`,
          onDismiss: dismissFinishCallout,
        }
      : undefined;

  // I'm finished does what the pathway's finish block says: asks through
  // its dialog, plays its checkpoint, then finishes the level the way any
  // Lab2 level does, each part skipped when absent.
  const {dialog: finishDialogContent, checkpoint: finishCheckpoint} =
    pathway.finish ?? {};
  const [finishAsked, setFinishAsked] = useState(false);
  // A viewing teacher must not report success or leave the student's level.
  const finishLevel = () => {
    if (!isReadonly) return dispatch(continueOrFinishLesson());
    clearUrl();
    setView({kind: 'map'});
  };
  const enterFinish = () => {
    if (!finishCheckpoint) return finishLevel();
    clearUrl();
    setView({kind: 'step', checkpointId: finishCheckpoint.id});
  };
  const requestFinish = () => {
    if (finishLocked) return;
    if (finishDialogContent) setFinishAsked(true);
    else enterFinish();
  };
  const finishDialog = finishAsked && finishDialogContent && (
    <FinishDialog
      dialog={finishDialogContent}
      onKeepWorking={() => setFinishAsked(false)}
      onFinish={() => {
        setFinishAsked(false);
        enterFinish();
      }}
    />
  );
  // The tutor in Weblab2 steps goes through the AI gateway while adaptive AI
  // is on; the tutor checks the student's access itself.
  useEffect(() => {
    setAiGatewayOptIn(isAdaptiveAiEnabled());
    return () => setAiGatewayOptIn(false);
  }, []);

  const checkpoint =
    view.kind === 'step'
      ? findCheckpoint(pathway, view.checkpointId)
      : undefined;
  const playing = view.kind === 'project' ? project : checkpoint;
  // A review's build request is for the checkpoint it was made in.
  const [buildRequested, setBuildRequested] = useState(false);
  useEffect(() => setBuildRequested(false), [playing]);
  // The shell's AI calls run as the adaptive level, not the step's level.
  const aiContext = useMemo<AichatContext>(
    () => ({
      clientType: AiChatClientTypes.ADAPTIVE,
      currentLevelId: progressKey.levelId,
      scriptId: progressKey.scriptId,
      channelId: undefined,
    }),
    [progressKey.levelId, progressKey.scriptId]
  );
  const pathwayContext = useMemo(
    () =>
      playing && {
        pathway,
        progressKey,
        checkpoint: playing,
        statusMap,
        progress,
        isViewingStudent,
        isReadonly,
        viewAsUserId,
        saveGeneratedInstructions,
        recordValidation,
        aiContext,
        buildRequested,
        setBuildRequested,
      },
    [
      pathway,
      progressKey,
      playing,
      statusMap,
      progress,
      isViewingStudent,
      isReadonly,
      viewAsUserId,
      saveGeneratedInstructions,
      recordValidation,
      aiContext,
      buildRequested,
    ]
  );

  if (pathwayContext) {
    const isProject = view.kind === 'project';
    const {checkpoint} = pathwayContext;
    const completeStepInCheckpoint = (step: Step, timeMs: number) => {
      completeStep(step, timeMs);
      if (isProject || isComplete(checkpoint, progress)) return;
      const steps = visibleSteps(checkpoint, progress);
      if (steps.at(-1)?.id !== step.id) return;
      const priorSeconds = steps.reduce(
        (sum, s) => sum + (progress.steps[s.id]?.timeSpent ?? 0),
        0
      );
      sendAdaptiveEvent(EVENTS.ADAPTIVE_CHECKPOINT_COMPLETED, {
        checkpointId: checkpoint.id,
        totalTimeSeconds: priorSeconds + Math.ceil(timeMs / 1000),
        stepsVisible: steps.length,
        routeAfterCompletion: !!checkpoint.routeAfterCompletion,
      });
    };
    const isFinish = checkpoint === finishCheckpoint;
    const goToMap = () => {
      clearUrl();
      setView({kind: 'map'});
    };
    return (
      <div className={styles.app}>
        {isViewingStudent && !isProject && lockedAtOpen.current.locked && (
          <TeacherViewingStudentProjectAlert
            inWorkspaceContainer
            type="warning"
            getAlertText={name => (
              <>
                <strong>{name ?? 'This student'}</strong> has not unlocked this
                checkpoint
              </>
            )}
          />
        )}
        <PathwayContext.Provider value={pathwayContext}>
          <StepPlayer
            key={checkpoint.id}
            checkpoint={checkpoint}
            finishLabel={isProject ? 'Back to map' : undefined}
            headerTitle={isProject || isFinish ? checkpoint.title : undefined}
            initialStepId={view.kind === 'step' ? view.stepId : undefined}
            onStartStep={startStep}
            onCompleteStep={completeStepInCheckpoint}
            onLeaveStep={leaveStep}
            onSaveAnswers={saveAnswers}
            onExit={goToMap}
            onFinish={() => {
              if (isFinish) return finishLevel();
              clearUrl();
              setView({
                kind: 'map',
                focusNext: !isProject && !!checkpoint.routeAfterCompletion,
              });
            }}
            onFinishPathway={isProject || isFinish ? undefined : requestFinish}
            finishDisabledReason={finishDisabledReason}
            activeTab={isProject ? 'project' : undefined}
            onTabChange={
              isProject
                ? tab => {
                    if (tab === 'map') goToMap();
                  }
                : undefined
            }
            projectName={isProject ? projectName : undefined}
          />
        </PathwayContext.Provider>
        {finishDialog}
      </div>
    );
  }

  const hasSkippedCheckpoints = Object.values(statusMap).some(
    s => s === 'skipped'
  );

  return (
    <div className={styles.app}>
      <AdaptiveHeader
        title={`Skill Map: ${pathway.title}`}
        onFinish={() => {
          sendFinalProjectClicked('mapHeader', statusMap);
          requestFinish();
        }}
        finishDisabledReason={finishDisabledReason}
        finishCallout={finishCallout}
      />
      <div style={{position: 'relative'}}>
        <AdaptiveTabBar
          activeTab="map"
          onTabChange={tab => {
            if (tab === 'project') {
              sendFinalProjectClicked('mapTab', statusMap);
              openProject();
            }
          }}
          projectName={projectName}
          skills={getSkillProgress(pathway, statusMap)}
          timeSpentSeconds={totalTimeSpent(progress)}
        />
        {allCheckpointsComplete && !calloutDismissed && !finishCallout && (
          <FinalProjectCallout onDismiss={dismissCallout} />
        )}
      </div>
      <MapScreen
        pathway={pathway}
        levelProperties={levelProperties}
        statusMap={statusMap}
        stepShares={stepShares}
        evidence={evidence}
        focusId={view.kind === 'map' ? view.focusId : undefined}
        onFocus={focusId => setView({kind: 'map', focusId})}
        canOpenLocked={isViewingStudent}
        onStart={id => {
          if (!isReadonly) {
            dispatch(sendStartedReportIfNotStarted('adaptive'));
          }
          const cp = findCheckpoint(pathway, id);
          setView({
            kind: 'step',
            checkpointId: id,
            stepId: cp ? stepIdToResume(cp, progress) : undefined,
          });
        }}
        hasSkippedCheckpoints={hasSkippedCheckpoints}
      />
      {finishDialog}
    </div>
  );
};

export default PathwayApp;
