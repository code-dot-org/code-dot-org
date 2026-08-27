import {Button, IconButton, Typography} from '@mui/material';
import {Link} from '@tanstack/react-router';
import {useEffect, useMemo, useRef, useState} from 'react';

import type {
  CourseModel,
  Experience,
  Lesson,
  Unit,
} from '@code-dot-org/authoring';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi} from '../api';
import {useCanAuthor} from '../authorGate';
import {useCompletion, type CompletionStatus} from '../completion';

import AuthorSidebar from './AuthorSidebar';
import ContentComposer from './ContentComposer';
import ExperienceStage, {
  type PanelSection,
  type StageEvent,
} from './ExperienceStage';
import OutlineRail from './OutlineRail';
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

// Properties-panel hover-intent tuning — see the panel state machine below.
const HOVER_INTENT_MS = 200;
const HOVER_CLOSE_GRACE_MS = 250;

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
  // Discovery is hover-driven (Mailchimp/Wix-style: hovering an editable
  // section previews it in the panel); a click "pins" the panel open
  // regardless of pointer position, and an in-progress edit pins it too —
  // neither a pinned nor a dirty panel is ever swapped or closed by hover.
  // Scoped to the active experience; switching experiences (selectIndex)
  // clears all three, rather than risk the panel showing a stale
  // experience's fields.
  const [panelSection, setPanelSection] = useState<PanelSection | undefined>();
  const [panelPinned, setPanelPinned] = useState(false);
  const [panelDirty, setPanelDirty] = useState(false);
  const hoverOpenTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(
    () => () => {
      clearTimeout(hoverOpenTimerRef.current);
      clearTimeout(hoverCloseTimerRef.current);
    },
    [],
  );
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
  const showPropertiesPanel =
    authorMode && !!panelSection && active?.kind === 'existingLevel';
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

  const selectIndex = (index: number) => {
    markLeaving();
    const experience = experiences[index];
    setActiveExperienceId(experience?.id);
    setLessonComplete(false);
    setInsertPosition(undefined);
    setEditingContentId(undefined);
    clearHoverTimers();
    setPanelSection(undefined);
    setPanelPinned(false);
    setPanelDirty(false);
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

  const clearHoverTimers = () => {
    clearTimeout(hoverOpenTimerRef.current);
    clearTimeout(hoverCloseTimerRef.current);
  };

  // Hovering a section (or the panel itself, so the pointer can travel
  // between them) previews it after a short intent delay — long enough that
  // sweeping the mouse across the lesson stage doesn't flicker panels open,
  // short enough to read as "hover to edit". Never swaps away from a pinned
  // or dirty panel: an in-progress edit must survive a stray mouse move.
  const handleSectionHoverEnter = (section: PanelSection) => {
    if (panelPinned || panelDirty) {
      return;
    }
    clearHoverTimers();
    if (panelSection === section) {
      return;
    }
    hoverOpenTimerRef.current = setTimeout(() => {
      setPanelSection(section);
    }, HOVER_INTENT_MS);
  };

  const handleHoverLeave = () => {
    if (panelPinned || panelDirty) {
      return;
    }
    clearHoverTimers();
    // Grace period, not an immediate close: the pointer has to cross real
    // screen space to get from the section to the panel (a fourth grid
    // column) or back, and an instant close would make that trip
    // impossible.
    hoverCloseTimerRef.current = setTimeout(() => {
      setPanelSection(undefined);
    }, HOVER_CLOSE_GRACE_MS);
  };

  const handlePanelHoverEnter = () => {
    if (panelPinned || panelDirty) {
      return;
    }
    clearHoverTimers();
  };

  // Clicking a section pins the panel open regardless of pointer position,
  // or — clicking the section that's already pinned open — unpins and
  // closes it (the same toggle-off gesture the old click-only design had).
  // Clicking a DIFFERENT section than the one currently dirty is a
  // deliberate navigation, not a stray mouse move — it discards that
  // unsaved edit rather than trapping the author on it; panelDirty always
  // resets here so the newly-selected section's own dirty tracking starts
  // clean.
  const handleSectionClick = (section: PanelSection) => {
    clearHoverTimers();
    if (panelPinned && panelSection === section) {
      setPanelPinned(false);
      setPanelDirty(false);
      setPanelSection(undefined);
      return;
    }
    setPanelDirty(false);
    setPanelSection(section);
    setPanelPinned(true);
  };

  const handlePanelClose = () => {
    clearHoverTimers();
    setPanelPinned(false);
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
          <OutlineRail
            lessonId={lesson.id}
            experiences={experiences}
            activeIndex={activeIndex}
            onSelect={selectIndex}
            onAskAiAt={setInsertPosition}
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
                {active && authorMode && active.kind === 'content' && (
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
                  active.kind === 'content' &&
                  editingContentId === active.id ? (
                    <ContentComposer
                      submitLabel="Save"
                      initialTitle={active.title}
                      initialMarkdown={active.markdown}
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
                      onSectionHoverEnter={handleSectionHoverEnter}
                      onSectionHoverLeave={handleHoverLeave}
                      onSectionClick={handleSectionClick}
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
          active?.kind === 'existingLevel' && (
            <PropertiesPanel
              key={`${active.id}-${panelSection}`}
              section={panelSection}
              experience={active}
              onClose={handlePanelClose}
              onDirtyChange={setPanelDirty}
              onPointerEnter={handlePanelHoverEnter}
              onPointerLeave={handleHoverLeave}
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
