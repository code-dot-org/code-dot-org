import {Button, IconButton, Typography} from '@mui/material';
import {Link} from '@tanstack/react-router';
import {useMemo, useRef, useState} from 'react';

import type {CourseModel, Lesson, Unit} from '@code-dot-org/authoring';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {authoringApi} from '../api';
import {useCanAuthor} from '../authorGate';

import AuthorSidebar from './AuthorSidebar';
import ContentComposer from './ContentComposer';
import ExperienceStage, {type StageEvent} from './ExperienceStage';
import OutlineRail from './OutlineRail';
import TutorDock, {type TutorDockHandle} from './TutorDock';

import styles from './authoring.module.scss';

interface LessonPlayerProps {
  course: CourseModel;
  unit: Unit;
  lesson: Lesson;
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
  const [studentView, setStudentView] = useState(false);
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
  const [inputOverrides, setInputOverrides] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const tutorRef = useRef<TutorDockHandle>(null);

  const authorMode = canAuthor && !studentView;
  const experiences = lesson.experiences;
  const activeIndex = useMemo(() => {
    const index = experiences.findIndex(e => e.id === activeExperienceId);
    return index >= 0 ? index : 0;
  }, [experiences, activeExperienceId]);
  const active = experiences[activeIndex];

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
  };

  const selectIndex = (index: number) => {
    const experience = experiences[index];
    setActiveExperienceId(experience?.id);
    setInsertPosition(undefined);
    setEditingContentId(undefined);
    if (tutorOn && experience) {
      void tutorRef.current?.push({
        kind: 'experience_shown',
        experienceId: experience.id,
      });
    }
  };

  const onTutorSelect = (
    experienceId: string,
    input?: Record<string, unknown>,
  ) => {
    const experience = experiences.find(e => e.id === experienceId);
    if (!experience) {
      return; // tutor named something outside the authored world: ignore
    }
    if (input) {
      setInputOverrides(prev => ({...prev, [experienceId]: input}));
    }
    setActiveExperienceId(experienceId);
  };

  return (
    <div className={styles.playerFrame}>
      <div className={styles.lessonHeaderBar}>
        <Link
          to="/author/$courseId"
          params={{courseId: course.id}}
          aria-label="Back to course"
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
          {experiences.map((experience, index) => (
            <button
              key={experience.id}
              type="button"
              aria-current={index === activeIndex ? 'step' : undefined}
              aria-label={experience.title ?? `Activity ${index + 1}`}
              className={
                index === activeIndex
                  ? `${styles.progressDot} ${styles.progressDotActive}`
                  : styles.progressDot
              }
              onClick={() => selectIndex(index)}
            />
          ))}
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
            onClick={() => setStudentView(view => !view)}
          >
            {studentView ? 'Back to authoring' : 'Student view'}
          </Button>
        )}
      </div>

      <div
        className={
          authorMode
            ? `${styles.playerLayout} ${styles.playerLayoutAuthor}`
            : styles.playerLayout
        }
      >
        {authorMode && (
          <AuthorSidebar
            scope={scope}
            scopeLabel={
              insertPosition !== undefined
                ? `${lesson.displayName} · insert at ${insertPosition + 1}`
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
              active.kind === 'content' && editingContentId === active.id ? (
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
          </div>
          <div className={styles.stageNav}>
            <Button
              size="small"
              variant="outlined"
              disabled={activeIndex <= 0}
              onClick={() => selectIndex(activeIndex - 1)}
            >
              Previous
            </Button>
            <Typography variant="body4">
              {experiences.length > 0
                ? `${Math.min(activeIndex + 1, experiences.length)} of ${experiences.length}`
                : 'No activities yet'}
            </Typography>
            <Button
              size="small"
              variant="contained"
              disabled={activeIndex >= experiences.length - 1}
              onClick={() => selectIndex(activeIndex + 1)}
            >
              Next
            </Button>
          </div>
        </div>
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
