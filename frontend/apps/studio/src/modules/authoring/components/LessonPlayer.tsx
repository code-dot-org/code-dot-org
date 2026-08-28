import {Button, IconButton, Typography} from '@mui/material';
import {Link} from '@tanstack/react-router';
import {useMemo, useRef, useState} from 'react';

import type {
  CourseModel,
  Experience,
  Lesson,
  Unit,
} from '@code-dot-org/authoring';
import type {BlocklySerialization, Toolbox} from '@code-dot-org/blockly';
import {makeBlocksEditable} from '@code-dot-org/blockly/utils';
import {
  convertBlocklyXmlToJson,
  convertBlocklyXmlToToolbox,
} from '@code-dot-org/blockly/xml';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi} from '../api';
import {useCanAuthor} from '../authorGate';
import {useCompletion, type CompletionStatus} from '../completion';
import {useAuthoringState, useLevelProperties} from '../hooks';
import {useLevelDraft} from '../levelDraft';

import AuthoringTopBar from './AuthoringTopBar';
import AuthorSidebar from './AuthorSidebar';
import ContentComposer from './ContentComposer';
import ExperienceStage, {
  type PanelSection,
  type StageEvent,
} from './ExperienceStage';
import LevelRail from './LevelRail';
import PropertiesPanel from './PropertiesPanel';
import TutorDock, {type TutorDockHandle} from './TutorDock';

import styles from './authoring.module.scss';

interface LessonPlayerProps {
  course: CourseModel;
  unit: Unit;
  lesson: Lesson;
}

// Per-tab, not per-course: an author toggling into student view expects it
// to stick while they click around the whole curriculum, not just one
// lesson. A fresh tab always starts in author mode.
const STUDENT_VIEW_KEY = 'authoring-student-view';

function readStudentViewFlag(): boolean {
  try {
    return window.sessionStorage.getItem(STUDENT_VIEW_KEY) === '1';
  } catch {
    return false;
  }
}

function writeStudentViewFlag(value: boolean): void {
  try {
    window.sessionStorage.setItem(STUDENT_VIEW_KEY, value ? '1' : '0');
  } catch {
    // Storage unavailable: the toggle still works for this render, it just
    // won't survive navigation.
  }
}

/**
 * Whether the stage's inline pencil/`ContentComposer` editor applies:
 * authored `content` experiences, plus an `existingLevel` whose generic data
 * is the markdown variant (External levels — `updateContent` already writes
 * `data.markdown` for these, see apply.ts's applyContentPatch; only the UI
 * gate excluded them).
 */
function markdownEditable(experience: Experience): boolean {
  return (
    experience.kind === 'content' ||
    (experience.kind === 'existingLevel' && experience.data?.type === 'markdown')
  );
}

/** The markdown text `markdownEditable` above says this experience can edit. */
function editableMarkdown(experience: Experience): string {
  if (experience.kind === 'content') {
    return experience.markdown;
  }
  if (experience.kind === 'existingLevel' && experience.data?.type === 'markdown') {
    return experience.data.markdown;
  }
  return '';
}

/** Content experiences complete on read; everything else needs an attempt. */
function completionForLeaving(experience: Experience): CompletionStatus {
  return experience.kind === 'content' ? 'passed' : 'attempted';
}

/** Best-effort completion signal from a stage event's widget/lab payload. */
function statusForStageEvent(data: unknown): CompletionStatus {
  if (data && typeof data === 'object') {
    const type = (data as {type?: unknown}).type;
    if (type === 'levelResult') {
      // ExperienceStage only forwards this event on a passing run (see its
      // RESULT_SUCCESS gate in handleLevelResult).
      return 'passed';
    }
    if (type === 'multi_answer' || type === 'match_answer') {
      return (data as {correct?: unknown}).correct === true
        ? 'passed'
        : 'attempted';
    }
  }
  // Widget events: shape is widget-defined, not a reliable completion
  // signal — treat any event as evidence the learner engaged.
  return 'attempted';
}

/**
 * The lesson experience. One component tree serves both audiences: author
 * affordances (rail, sidebar, toggles) are additive chrome around the same
 * stage a student gets. "Student view" removes the chrome — what remains is
 * the deterministic learner path (previous/next through the authored
 * sequence). The optional tutor rides the same stage.
 */
export default function LessonPlayer({
  course,
  unit,
  lesson,
}: LessonPlayerProps) {
  const canAuthor = useCanAuthor();
  // Re-fetching here (rather than threading course/unit/lesson's own
  // ancestor query down as new props) piggybacks on the same react-query
  // cache entry the route already populated — no extra network round trip,
  // and the top bar stays in sync with the same 'state' SSE invalidation
  // every other author-mode view already relies on.
  const {data: authoringState} = useAuthoringState();
  const [studentView, setStudentView] = useState(readStudentViewFlag);
  const [tutorOn, setTutorOn] = useState(false);
  // Tracked by id, not position: `experiences` is a server-owned array that
  // reorders/shrinks under the player (author drag/remove, agent edits). An
  // index would silently point at a different experience after a reorder.
  const [activeExperienceId, setActiveExperienceId] = useState<
    string | undefined
  >(() => lesson.experiences[0]?.id);
  const [insertPosition, setInsertPosition] = useState<number | undefined>();
  const [editingContentId, setEditingContentId] = useState<
    string | undefined
  >();
  // Properties-panel selection — see ExperienceStage's PanelSection.
  // Opens on click only (hover is discoverability-only: it highlights the
  // section via CSS, it does not open anything — product decision, 8/27,
  // superseding this component's earlier hover-intent design). Scoped to
  // the active experience; switching experiences (selectIndex) clears both,
  // rather than risk the panel showing a stale experience's fields.
  const [panelSection, setPanelSection] = useState<PanelSection | undefined>();
  const [panelDirty, setPanelDirty] = useState(false);
  // Level-editing state lives here, not in LevelRail or ExperienceStage: the
  // rail (author-facing controls) and the stage overlay/workspace (in the
  // mounted lab) are sibling subtrees under this component, so a tool
  // selection or a stage-side capture has to cross through a shared
  // ancestor — the same reasoning for all four states below.
  //
  // Map-painting: `mapDraftPatch` is undefined until the author paints at
  // least once; LevelRail folds it into its own Save draft via an effect,
  // the same way it already syncs from served levelProperties.
  const [selectedPaintToolId, setSelectedPaintToolId] = useState<
    string | undefined
  >();
  const [mapDraftPatch, setMapDraftPatch] = useState<
    {serialized_maze: string; maze: string; initial_dirt: string} | undefined
  >();
  // Toolbox tray: LevelRail reports the composed XML on every chip
  // add/remove; converted below into the live Toolbox object the stage's
  // flyout actually renders (editing.toolboxOverride) — see
  // packages/blockly/src/toolbox/index.ts's buildToolbox for why the JSON
  // shape, not the XML string, is what a live workspace prop swap wants.
  const [toolboxDraftXml, setToolboxDraftXml] = useState<string | undefined>();
  // Workspace mode (Author Mode Pass D — "Student start | My solution"):
  // LevelRail's mode buttons drive `workspaceMode`, which mode is
  // reporting captures, and (on a switch) `workspaceOverrideXml`, the
  // fresh program LevelRail wants the stage to load — see
  // resolveWorkspaceOverrideXml (workspaceMode.ts) for the precedence it
  // computes that from. `workspaceCaptureXml` carries every subsequent
  // mutation back the other direction (stage -> here -> LevelRail), same
  // shape as the map/toolbox capture props above. `solutionOffer` is the
  // "save as solution?" prompt, set by a passing run recorded while
  // workspaceMode is 'mySolution' (MazeLab's onSolutionRun, threaded
  // through ExperienceStage).
  const [workspaceMode, setWorkspaceMode] = useState<
    'studentStart' | 'mySolution' | undefined
  >();
  const [workspaceOverrideXml, setWorkspaceOverrideXml] = useState<
    string | undefined
  >();
  const [workspaceCaptureXml, setWorkspaceCaptureXml] = useState<
    string | undefined
  >();
  const [solutionOffer, setSolutionOffer] = useState<
    {solutionBlocksXml: string; blocksUsed: number} | undefined
  >();
  const [inputOverrides, setInputOverrides] = useState<
    Record<string, Record<string, unknown>>
  >({});
  // Set once the learner advances past the authored sequence's last
  // experience — renders the lesson-end card in place of the stage.
  const [lessonComplete, setLessonComplete] = useState(false);
  const tutorRef = useRef<TutorDockHandle>(null);
  const {map: completionMap, mark: markCompletion} = useCompletion(course.id);

  const authorMode = canAuthor && !studentView;
  const experiences = lesson.experiences;
  const activeIndex = useMemo(() => {
    const index = experiences.findIndex(e => e.id === activeExperienceId);
    return index >= 0 ? index : 0;
  }, [experiences, activeExperienceId]);
  const active = experiences[activeIndex];
  const activeLevelNumericId =
    active?.kind === 'existingLevel' ? active.levelNumericId : undefined;
  const {data: activeLevelPropertiesMap} = useLevelProperties(
    activeLevelNumericId,
  );
  const activeLevelProps =
    activeLevelNumericId !== undefined
      ? activeLevelPropertiesMap?.[String(activeLevelNumericId)]
      : undefined;
  // The shared draft behind the FINAL IA REVISION's three maze-editing
  // panel sections (visualization/toolbox/workspace) and the left rail's
  // level-metadata Level tab — see levelDraft.ts's doc comment for why one
  // hook backs all four. Called unconditionally (rules of hooks); harmless
  // when the active experience isn't a maze-family level, since nothing
  // downstream renders its fields in that case.
  const levelDraft = useLevelDraft({
    experienceId: active?.id,
    levelNumericId: activeLevelNumericId,
    levelPropertiesLoaded: activeLevelPropertiesMap !== undefined,
    skin: activeLevelProps?.skin as string | undefined,
    startDirection: activeLevelProps?.startDirection as string | undefined,
    toolboxBlocksXml: activeLevelProps?.toolboxBlocksXml as string | undefined,
    startBlocksXml: activeLevelProps?.startBlocksXml as string | undefined,
    solutionBlocksXml: activeLevelProps?.solutionBlocksXml as
      | string
      | undefined,
    ideal: activeLevelProps?.ideal as string | undefined,
    solutionVerified: activeLevelProps?.solutionVerified === 'true',
    nectarGoal: activeLevelProps?.nectar_goal as string | undefined,
    honeyGoal: activeLevelProps?.honey_goal as string | undefined,
    minCollected: activeLevelProps?.min_collected as string | undefined,
    mapDraftPatch,
    workspaceMode,
    onWorkspaceModeChange: setWorkspaceMode,
    onWorkspaceOverrideChange: setWorkspaceOverrideXml,
    workspaceCaptureXml,
    solutionOffer,
    onDismissSolutionOffer: () => setSolutionOffer(undefined),
    onToolboxDraftChange: setToolboxDraftXml,
    onDiscardStageState: () => {
      setSelectedPaintToolId(undefined);
      setMapDraftPatch(undefined);
      setToolboxDraftXml(undefined);
      setWorkspaceMode(undefined);
      setWorkspaceOverrideXml(undefined);
      setWorkspaceCaptureXml(undefined);
      setSolutionOffer(undefined);
    },
  });
  // Dirty for either the right panel (whichever section is open) or the
  // shared level draft the left rail's Save/Discard also act on — either
  // one gates navigation (selectIndex) and shows in the top bar.
  const levelRailDirty = levelDraft.dirty;
  const showPropertiesPanel =
    authorMode &&
    !!panelSection &&
    (active?.kind === 'existingLevel' || active?.kind === 'widget');
  // The tray reports XML (the Save-patch shape); the stage's flyout wants
  // the JSON Toolbox shape (see toolbox/index.ts's buildToolbox) — convert
  // once here rather than in both LevelRail and ExperienceStage.
  const toolboxOverride: Toolbox | undefined = useMemo(
    () =>
      toolboxDraftXml === undefined
        ? undefined
        : convertBlocklyXmlToToolbox(new DOMParser(), toolboxDraftXml),
    [toolboxDraftXml],
  );
  // Mirrors toolboxOverride's XML->JSON conversion, for whichever program
  // LevelRail wants loaded on a workspace-mode switch (see
  // workspaceOverrideXml's state comment). "Student start" additionally
  // strips any deletable=false/movable=false a real level pins its starter
  // blocks with (production levels do this for the STUDENT — e.g. a Bee
  // level gluing down a maze_nectar block) — an author editing that same
  // layout needs to select/move/delete them too, or editing could only
  // ever add blocks. Never applied to 'mySolution' (the author's own
  // attempt, never served frozen) or to the plain student-runtime mount,
  // which never goes through this override at all (see
  // MazeLabEditingProps.workspaceOverride's doc comment).
  const workspaceOverride: BlocklySerialization | undefined = useMemo(() => {
    if (workspaceOverrideXml === undefined) {
      return undefined;
    }
    const json = convertBlocklyXmlToJson(new DOMParser(), workspaceOverrideXml);
    return workspaceMode === 'studentStart' ? makeBlocksEditable(json) : json;
  }, [workspaceOverrideXml, workspaceMode]);
  const nextLesson = useMemo(() => {
    const lessonIndex = unit.lessons.findIndex(l => l.id === lesson.id);
    return lessonIndex >= 0 ? unit.lessons[lessonIndex + 1] : undefined;
  }, [unit.lessons, lesson.id]);
  const completedCount = useMemo(
    () => experiences.filter(e => completionMap[e.id] === 'passed').length,
    [experiences, completionMap],
  );

  const scope = useMemo(
    () => ({
      courseId: course.id,
      unitId: unit.id,
      lessonId: lesson.id,
      experienceId: authorMode ? active?.id : undefined,
      insertPosition,
    }),
    [course.id, unit.id, lesson.id, active?.id, authorMode, insertPosition],
  );

  const onStageEvent = (event: StageEvent) => {
    if (tutorOn) {
      void tutorRef.current?.push({
        kind: 'widget_event',
        experienceId: event.experienceId,
        data: event.data,
      });
    }
    markCompletion(event.experienceId, statusForStageEvent(event.data));
  };

  // Marks the experience the learner is leaving. Called at the top of every
  // navigation action below — never from an effect: a cleanup-based effect
  // fires on React's dev-mode double-invoke mount/unmount, which would mark
  // an experience 'attempted' the instant it mounts, before anyone actually
  // left it. markCompletion never downgrades an experience already 'passed'.
  const markLeaving = () => {
    if (active) {
      markCompletion(active.id, completionForLeaving(active));
    }
  };

  // Never silently discards an in-progress LevelRail edit — same rule
  // handleSectionClick already applies to the right panel. The author has
  // to Save or Discard first (LevelRail's own buttons).
  const selectIndex = (index: number) => {
    if (levelRailDirty) {
      return;
    }
    markLeaving();
    const experience = experiences[index];
    setActiveExperienceId(experience?.id);
    setLessonComplete(false);
    setInsertPosition(undefined);
    setEditingContentId(undefined);
    setPanelSection(undefined);
    setPanelDirty(false);
    setSelectedPaintToolId(undefined);
    setMapDraftPatch(undefined);
    setToolboxDraftXml(undefined);
    setWorkspaceMode(undefined);
    setWorkspaceOverrideXml(undefined);
    setWorkspaceCaptureXml(undefined);
    setSolutionOffer(undefined);
    if (tutorOn && experience) {
      void tutorRef.current?.push({
        kind: 'experience_shown',
        experienceId: experience.id,
      });
    }
  };

  // A lab's terminal "Continue" reuses the same next-navigation as the
  // stage's own Next button. Advancing past the last experience renders the
  // lesson-end card instead of leaving a disabled button in place.
  const goToNext = () => {
    if (activeIndex < experiences.length - 1) {
      selectIndex(activeIndex + 1);
      return;
    }
    markLeaving();
    setLessonComplete(true);
  };

  // Clicking a section opens the panel pinned on it, or — clicking the
  // section that's already open — closes it (the same toggle-off gesture
  // Close/Esc offer). Clicking a DIFFERENT section while the current one is
  // dirty is a no-op: an in-progress edit is never discarded by a stray
  // click elsewhere — the author has to close (or save) it explicitly
  // first. Re-clicking the dirty section itself still closes/discards,
  // same as Close/Esc would.
  const handleSectionClick = (section: PanelSection) => {
    if (panelDirty && panelSection !== section) {
      return;
    }
    if (panelSection === section) {
      setPanelDirty(false);
      setPanelSection(undefined);
      return;
    }
    setPanelDirty(false);
    setPanelSection(section);
  };

  const handlePanelClose = () => {
    setPanelDirty(false);
    setPanelSection(undefined);
  };

  const onTutorSelect = (
    experienceId: string,
    input?: Record<string, unknown>,
  ) => {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience) {
      return; // tutor named something outside the authored world: ignore
    }
    markLeaving();
    if (input) {
      setInputOverrides(prev => ({...prev, [experienceId]: input}));
    }
    setActiveExperienceId(experienceId);
    setLessonComplete(false);
  };

  return (
    <div className={styles.playerFrame}>
      <div className={styles.lessonHeaderBar}>
        <Link
          to="/author/$courseId"
          params={{courseId: course.id}}
          aria-label="Back to course"
          onClick={markLeaving}
        >
          <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
        </Link>
        <div className={styles.lessonHeaderTitles}>
          <Typography variant="body4">
            {course.displayName} · {unit.displayName}
          </Typography>
          <Typography variant="h6" component="h1">
            {lesson.displayName}
          </Typography>
        </div>
        <nav className={styles.progressDots} aria-label="Lesson progress">
          {experiences.map((experience, index) => {
            const status = completionMap[experience.id];
            const isActive = index === activeIndex;
            const dotClasses = [styles.progressDot];
            if (status === 'passed') {
              dotClasses.push(styles.progressDotDone);
            } else if (status === 'attempted') {
              dotClasses.push(styles.progressDotAttempted);
            }
            if (isActive) {
              dotClasses.push(styles.progressDotActive);
            }
            return (
              <button
                key={experience.id}
                type="button"
                aria-current={isActive ? 'step' : undefined}
                aria-label={dotAriaLabel(
                  experience,
                  index,
                  experiences.length,
                  status,
                  isActive,
                )}
                className={dotClasses.join(' ')}
                onClick={() => selectIndex(index)}
              />
            );
          })}
        </nav>
        <div className={styles.lessonHeaderSpacer} />
        {canAuthor && authoringState && (
          <AuthoringTopBar
            changes={authoringState.changes}
            courses={authoringState.courses}
            lastPublish={authoringState.lastPublish}
            dirty={panelDirty || levelRailDirty}
          />
        )}
        <Button
          size="small"
          variant={tutorOn ? 'contained' : 'outlined'}
          onClick={() => setTutorOn(on => !on)}
        >
          AI tutor {tutorOn ? 'on' : 'off'}
        </Button>
        {canAuthor && (
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              setStudentView(view => {
                const next = !view;
                writeStudentViewFlag(next);
                return next;
              })
            }
          >
            {studentView ? 'Back to authoring' : 'Student view'}
          </Button>
        )}
      </div>

      <div
        className={
          authorMode
            ? `${styles.playerLayout} ${styles.playerLayoutAuthor}${
                showPropertiesPanel ? ` ${styles.playerLayoutPanelOpen}` : ''
              }`
            : styles.playerLayout
        }
      >
        {authorMode && (
          <AuthorSidebar
            scope={scope}
            scopeLabel={
              insertPosition !== undefined
                ? `${lesson.displayName} · ${describeInsertPosition(experiences, insertPosition)}`
                : (active?.title ?? lesson.displayName)
            }
            quickActions={
              experiences.length === 0 ? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    void authoringApi.sendChat(scope, 'Build this lesson.')
                  }
                >
                  Build this lesson
                </Button>
              ) : undefined
            }
          />
        )}

        {authorMode && (
          <LevelRail
            lessonId={lesson.id}
            experiences={experiences}
            activeIndex={activeIndex}
            onSelect={selectIndex}
            onAskAiAt={setInsertPosition}
            active={active}
            levelDraft={levelDraft}
          />
        )}

        <div className={styles.stageColumn}>
          <div className={styles.stageScroll}>
            {lessonComplete ? (
              <LessonEndCard
                course={course}
                lesson={lesson}
                nextLesson={nextLesson}
                completedCount={completedCount}
                totalCount={experiences.length}
              />
            ) : (
              <>
                {active && authorMode && markdownEditable(active) && (
                  <div className={styles.contentEditBar}>
                    {editingContentId === active.id ? undefined : (
                      <IconButton
                        size="small"
                        aria-label="Edit content"
                        onClick={() => setEditingContentId(active.id)}
                      >
                        <FontAwesomeV6Icon
                          iconName="pen-to-square"
                          iconStyle="solid"
                        />
                      </IconButton>
                    )}
                  </div>
                )}
                {active ? (
                  markdownEditable(active) &&
                  editingContentId === active.id ? (
                    <ContentComposer
                      submitLabel="Save"
                      initialTitle={active.title}
                      initialMarkdown={editableMarkdown(active)}
                      onCancel={() => setEditingContentId(undefined)}
                      onSubmit={async ({title, markdown}) => {
                        await authoringApi.applyChange({
                          op: 'updateContent',
                          experienceId: active.id,
                          patch: {title, markdown},
                        });
                        setEditingContentId(undefined);
                      }}
                    />
                  ) : (
                    <ExperienceStage
                      key={active.id}
                      experience={
                        active.kind === 'widget' && inputOverrides[active.id]
                          ? {...active, defaultInput: inputOverrides[active.id]}
                          : active
                      }
                      onStageEvent={onStageEvent}
                      authorMode={authorMode}
                      onContinue={goToNext}
                      selectedSection={panelSection}
                      onSectionClick={handleSectionClick}
                      selectedPaintToolId={selectedPaintToolId}
                      onMapDraftChange={setMapDraftPatch}
                      toolboxOverride={toolboxOverride}
                      workspaceMode={workspaceMode}
                      workspaceOverride={workspaceOverride}
                      onWorkspaceChange={setWorkspaceCaptureXml}
                      onSolutionRun={setSolutionOffer}
                    />
                  )
                ) : (
                  <EmptyLesson lesson={lesson} showPlan={authorMode} />
                )}
                {tutorOn && (
                  <TutorDock
                    ref={tutorRef}
                    lessonId={lesson.id}
                    onSelectExperience={onTutorSelect}
                  />
                )}
              </>
            )}
          </div>
          <div className={styles.stageNav}>
            <Button
              size="small"
              variant="outlined"
              disabled={
                lessonComplete ? experiences.length === 0 : activeIndex <= 0
              }
              onClick={() =>
                lessonComplete
                  ? setLessonComplete(false)
                  : selectIndex(activeIndex - 1)
              }
            >
              Previous
            </Button>
            <Typography variant="body4">
              {lessonComplete
                ? 'Lesson complete'
                : experiences.length > 0
                  ? `${Math.min(activeIndex + 1, experiences.length)} of ${experiences.length}`
                  : 'No activities yet'}
            </Typography>
            <Button
              size="small"
              variant="contained"
              disabled={lessonComplete || experiences.length === 0}
              onClick={goToNext}
            >
              Next
            </Button>
          </div>
        </div>

        {showPropertiesPanel &&
          panelSection &&
          (active?.kind === 'existingLevel' || active?.kind === 'widget') && (
            <PropertiesPanel
              key={`${active.id}-${panelSection}`}
              experience={active}
              section={panelSection}
              onClose={handlePanelClose}
              onDirtyChange={setPanelDirty}
              levelDraft={levelDraft}
              selectedPaintToolId={selectedPaintToolId}
              onSelectPaintTool={setSelectedPaintToolId}
              workspaceMode={workspaceMode}
              solutionOffer={solutionOffer}
              onDismissSolutionOffer={() => setSolutionOffer(undefined)}
            />
          )}
      </div>
    </div>
  );
}

// "insert at 3" reads as an array index; an author thinks in terms of what's
// next to the slot, not its position number.
function describeInsertPosition(
  experiences: {id: string; title?: string}[],
  position: number,
): string {
  const titleOf = (e?: {id: string; title?: string}) => e?.title ?? e?.id;
  const before = experiences[position - 1];
  const after = experiences[position];
  if (!before && !after) {
    return 'at the start of the lesson';
  }
  if (!before) {
    return `at the start of the lesson, before "${titleOf(after)}"`;
  }
  if (!after) {
    return `at the end of the lesson, after "${titleOf(before)}"`;
  }
  return `between "${titleOf(before)}" and "${titleOf(after)}"`;
}

function dotAriaLabel(
  experience: Experience,
  index: number,
  total: number,
  status: CompletionStatus | undefined,
  isActive: boolean,
): string {
  const position = `Activity ${index + 1} of ${total}`;
  const statusLabel =
    status === 'passed'
      ? 'completed'
      : status === 'attempted'
        ? 'in progress'
        : 'not started';
  const label = experience.title
    ? `${experience.title} — ${position}, ${statusLabel}`
    : `${position}, ${statusLabel}`;
  return isActive ? `${label}, current` : label;
}

function LessonEndCard({
  course,
  lesson,
  nextLesson,
  completedCount,
  totalCount,
}: {
  course: CourseModel;
  lesson: Lesson;
  nextLesson?: Lesson;
  completedCount: number;
  totalCount: number;
}) {
  return (
    <div className={styles.lessonEndCard}>
      <Typography variant="h5">You finished {lesson.displayName}!</Typography>
      <Typography variant="body1">
        You completed {completedCount} of {totalCount} activit
        {totalCount === 1 ? 'y' : 'ies'}.
      </Typography>
      <div className={styles.lessonEndActions}>
        <Link
          to="/author/$courseId"
          params={{courseId: course.id}}
          className={styles.lessonEndLink}
        >
          Back to course outline
        </Link>
        {nextLesson && (
          <Link
            to="/author/$courseId/$lessonId"
            params={{courseId: course.id, lessonId: nextLesson.id}}
            className={`${styles.lessonEndLink} ${styles.lessonEndLinkPrimary}`}
          >
            Next lesson: {nextLesson.displayName}
          </Link>
        )}
      </div>
    </div>
  );
}

function EmptyLesson({lesson, showPlan}: {lesson: Lesson; showPlan: boolean}) {
  return (
    <div className={styles.contentCard}>
      <Typography variant="h5">{lesson.displayName}</Typography>
      {lesson.overview && (
        <Typography variant="body1">{lesson.overview}</Typography>
      )}
      {showPlan ? (
        <>
          {lesson.goal && (
            <Typography variant="body2">Goal: {lesson.goal}</Typography>
          )}
          {lesson.outline && lesson.outline.length > 0 && (
            <ul>
              {lesson.outline.map(step => (
                <li key={step}>
                  <Typography variant="body2">{step}</Typography>
                </li>
              ))}
            </ul>
          )}
          <Typography variant="body2">
            This lesson is an outline. Ask the AI to “Build this lesson” when
            the plan looks right.
          </Typography>
        </>
      ) : (
        <Typography variant="body2">
          This lesson has no activities yet.
        </Typography>
      )}
    </div>
  );
}
