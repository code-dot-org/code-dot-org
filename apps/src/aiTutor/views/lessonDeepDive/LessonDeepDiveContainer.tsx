import {
  LessonSummaryCard,
  LevelsAttemptedBox,
  PreReviewBox,
  PreSkillsCheck,
  TimeSpentBox,
  TutorSummaryBox,
  ValidatedLevelsBox,
  WelcomeBox,
} from '@code-dot-org/lesson-deep-dive';
import React, {FC, useCallback, useEffect, useMemo, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import FizzyButton from './FizzyButton';
import ReflectionBox from './Reflection/ReflectionBox';
import InterventionBox from './ReviewModalities/InterventionBox';
import SkillsCheck from './SkillsCheck/SkillsCheck';
import {LessonDeepDiveData, ReflectionData, ReflectionValue} from './types';

import styles from './lesson-deep-dive-container.module.scss';

const BOX_IDS = [
  'welcome',
  'levels-attempted',
  'time-spent',
  'validated-levels',
  'lesson-summary',
  'reflection',
  'pre-review',
  'intervention',
  'pre-skills-check',
  'skills-check',
  'tutor-summary',
] as const;

// Screens that use the story card layout — they handle their own navigation
// and progress indicator internally.
const STORY_SCREENS = new Set([
  'welcome',
  'levels-attempted',
  'time-spent',
  'validated-levels',
  'lesson-summary',
]);

const STORY_SCREEN_ORDER = [
  'welcome',
  'levels-attempted',
  'time-spent',
  'validated-levels',
  'lesson-summary',
] as const;

const TOTAL_STORY_SLIDES = STORY_SCREEN_ORDER.length;

const STORY_CARD_DURATION_MS = 5_000;

// Five gradients that rotate in a fixed order. A random starting index is
// picked on mount so the sequence begins on a different color each session.
const GRADIENT_CYCLE = [
  'linear-gradient(to bottom, #EC4899, #F9C8DF)', // pink
  'linear-gradient(to bottom, #38C8F8, #D0EFFC)', // blue
  'linear-gradient(to bottom, #22D45A, #BAFAD0)', // green
  'linear-gradient(to bottom, #F97316, #FDDAB0)', // orange
  'linear-gradient(to bottom, #8060E0, #CAC0F4)', // purple
] as const;

// Card positions in the original 6-card sequence. The streak card (position 4)
// is omitted here, so the summary lands at position 5 — which wraps back to 0
// mod 5, giving it the same color as the welcome card.
const CARD_SLOT_OFFSETS = {
  welcome: 0,
  levels: 1,
  time: 2,
  validated: 3,
  summary: 5,
} as const;

type RecapVariant = {
  welcome: string;
  levels: {headline: string; headlineFirst: boolean};
  time: {headline: string; headlineFirst: boolean; headlineAlign?: 'left' | 'right'};
  validated: {headline: string; headlineAlign: 'left' | 'right'};
  summary: string;
};

const RECAP_VARIANTS: RecapVariant[] = [
  {
    welcome: "THAT'S\nA WRAP",
    levels: {headline: 'YOU GOT\nIT DONE', headlineFirst: false},
    time: {headline: 'MINUTES IN\nTHE ZONE', headlineFirst: true},
    validated: {headline: 'VALIDATED\nAND PASSED', headlineAlign: 'left'},
    summary: 'THE WHOLE\nPICTURE',
  },
  {
    welcome: 'YOU CRUSHED IT',
    levels: {headline: 'LEVEL UP,\nLEGEND', headlineFirst: true},
    time: {headline: 'TIME WELL\nSPENT', headlineFirst: false},
    validated: {headline: 'CHECKED AND\nCLEARED', headlineAlign: 'right'},
    summary: 'EVERYTHING\nAT A GLANCE',
  },
  {
    welcome: 'DONE AND DONE',
    levels: {headline: 'YOU WENT\nAFTER IT', headlineFirst: false},
    time: {headline: 'LOCKED IN', headlineFirst: false, headlineAlign: 'right'},
    validated: {headline: 'RUNTIME:\nSUCCESS', headlineAlign: 'left'},
    summary: 'THE RECEIPT',
  },
  {
    welcome: 'LESSON HANDLED',
    levels: {headline: 'MISSION\nACCOMPLISHED', headlineFirst: false},
    time: {headline: 'FOCUS MODE\nON', headlineFirst: false},
    validated: {headline: 'YOU MADE\nIT WORK', headlineAlign: 'left'},
    summary: 'THAT WAS\nYOUR LESSON',
  },
  {
    welcome: 'NICELY DONE',
    levels: {headline: 'YOU LEVELED UP', headlineFirst: false},
    time: {headline: 'DIALED IN', headlineFirst: true},
    validated: {headline: 'PROBLEM SOLVED', headlineAlign: 'left'},
    summary: 'ALL OF IT\nAT ONCE',
  },
];

interface LessonDeepDiveContainerProps {
  lessonDeepDiveData: LessonDeepDiveData;
}

const LessonDeepDiveContainer: FC<LessonDeepDiveContainerProps> = ({
  lessonDeepDiveData,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reflectionData, setReflectionData] = useState<ReflectionData | null>(
    null
  );

  // Both values are fixed for the lifetime of this component instance.
  const colorOffset = useMemo(
    () => Math.floor(Math.random() * GRADIENT_CYCLE.length),
    []
  );
  const variant = useMemo(
    () => RECAP_VARIANTS[Math.floor(Math.random() * RECAP_VARIANTS.length)],
    []
  );

  const getGradient = useCallback(
    (slotOffset: number) =>
      GRADIENT_CYCLE[(colorOffset + slotOffset) % GRADIENT_CYCLE.length],
    [colorOffset]
  );
  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, BOX_IDS.length - 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  useEffect(() => {
    const screenId = BOX_IDS[currentIndex];
    if (!STORY_SCREENS.has(screenId) || screenId === 'lesson-summary') return;
    const id = setTimeout(goToNext, STORY_CARD_DURATION_MS);
    return () => clearTimeout(id);
  }, [currentIndex, goToNext]);

  // Continue advances to the next box. When the student is on the reflection
  // step and hasn't submitted, this is a bypass: kick off podcast generation
  // with every objective treated as struggling so the podcast modality has
  // something to play. Fire and forget — the server enqueues a background job
  // and PodcastsBox retrieves it later.
  const handleContinue = useCallback(() => {
    if (BOX_IDS[currentIndex] === 'reflection' && !reflectionData) {
      HttpClient.post(
        '/ai_student_podcasts/generate_podcast',
        JSON.stringify({
          lesson_id: lessonDeepDiveData.lessonId,
          objective_ids: lessonDeepDiveData.objectives.map(o => o.id),
        }),
        true, // useAuthenticityToken
        {'Content-Type': 'application/json'}
      ).catch(() => {});
    }
    goToNext();
  }, [
    currentIndex,
    reflectionData,
    lessonDeepDiveData.lessonId,
    lessonDeepDiveData.objectives,
    goToNext,
  ]);

  const handleReflectionComplete = useCallback((data: ReflectionData) => {
    setReflectionData(data);
  }, []);

  // Returns the description of the first objective the student is struggling
  // with or still working on, used as the focus topic in PreReviewBox.
  const getFocusTopic = useCallback(
    (data: ReflectionData | null): string | undefined => {
      if (!data) return undefined;
      const priority: ReflectionValue[] = [
        LessonObjectiveReflectionValues.LOST,
        LessonObjectiveReflectionValues.UNSURE,
      ];
      for (const level of priority) {
        const match = lessonDeepDiveData.objectives.find(
          o => data.objectiveReflections[o.id] === level
        );
        if (match) return match.description;
      }
      return undefined;
    },
    [lessonDeepDiveData.objectives]
  );

  if (!experiments.isEnabledAllowingQueryString(experiments.LESSON_TUTOR)) {
    return null;
  }

  const currentScreenId = BOX_IDS[currentIndex];
  const isStoryScreen = STORY_SCREENS.has(currentScreenId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === BOX_IDS.length - 1;

  // 1-indexed slide position within the story sequence.
  const currentStorySlide =
    (STORY_SCREEN_ORDER as readonly string[]).indexOf(currentScreenId) + 1;

  const renderBox = () => {
    switch (currentScreenId) {
      case 'welcome':
        return (
          <WelcomeBox
            gradient={getGradient(CARD_SLOT_OFFSETS.welcome)}
            headline={variant.welcome}
            lessonName={lessonDeepDiveData.lessonName}
            autoAdvanceDurationMs={STORY_CARD_DURATION_MS}
            currentSlide={currentStorySlide}
            totalSlides={TOTAL_STORY_SLIDES}
            onNext={goToNext}
          />
        );
      case 'levels-attempted':
        return (
          <LevelsAttemptedBox
            gradient={getGradient(CARD_SLOT_OFFSETS.levels)}
            headline={variant.levels.headline}
            headlineFirst={variant.levels.headlineFirst}
            lessonName={lessonDeepDiveData.lessonName}
            levelsAttempted={
              lessonDeepDiveData.progressCounts.levelsAttemptedCount
            }
            levelsTotal={lessonDeepDiveData.progressCounts.levelsTotalCount}
            autoAdvanceDurationMs={STORY_CARD_DURATION_MS}
            currentSlide={currentStorySlide}
            totalSlides={TOTAL_STORY_SLIDES}
            onNext={goToNext}
          />
        );
      case 'time-spent':
        return (
          <TimeSpentBox
            gradient={getGradient(CARD_SLOT_OFFSETS.time)}
            headline={variant.time.headline}
            headlineFirst={variant.time.headlineFirst}
            headlineAlign={variant.time.headlineAlign}
            lessonName={lessonDeepDiveData.lessonName}
            timeSpentSeconds={lessonDeepDiveData.timeSpentSeconds}
            autoAdvanceDurationMs={STORY_CARD_DURATION_MS}
            currentSlide={currentStorySlide}
            totalSlides={TOTAL_STORY_SLIDES}
            onNext={goToNext}
          />
        );
      case 'validated-levels':
        return (
          <ValidatedLevelsBox
            gradient={getGradient(CARD_SLOT_OFFSETS.validated)}
            headline={variant.validated.headline}
            headlineAlign={variant.validated.headlineAlign}
            lessonName={lessonDeepDiveData.lessonName}
            validatedLevelsTotalCount={
              lessonDeepDiveData.progressCounts.validatedLevelsTotalCount
            }
            validatedLevelsCorrectCount={
              lessonDeepDiveData.progressCounts.validatedLevelsCorrectCount
            }
            validatedLevelsIncorrectCount={
              lessonDeepDiveData.progressCounts.validatedLevelsIncorrectCount
            }
            autoAdvanceDurationMs={STORY_CARD_DURATION_MS}
            currentSlide={currentStorySlide}
            totalSlides={TOTAL_STORY_SLIDES}
            onNext={goToNext}
          />
        );
      case 'lesson-summary':
        return (
          <LessonSummaryCard
            gradient={getGradient(CARD_SLOT_OFFSETS.summary)}
            headline={variant.summary}
            lessonName={lessonDeepDiveData.lessonName}
            levelsAttempted={
              lessonDeepDiveData.progressCounts.levelsAttemptedCount
            }
            levelsTotal={lessonDeepDiveData.progressCounts.levelsTotalCount}
            timeSpentSeconds={lessonDeepDiveData.timeSpentSeconds}
            validatedCorrect={
              lessonDeepDiveData.progressCounts.validatedLevelsCorrectCount
            }
            validatedTotal={
              lessonDeepDiveData.progressCounts.validatedLevelsTotalCount
            }
            autoAdvanceDurationMs={STORY_CARD_DURATION_MS}
            currentSlide={currentStorySlide}
            totalSlides={TOTAL_STORY_SLIDES}
            onNext={goToNext}
          />
        );
      case 'reflection':
        return (
          <ReflectionBox
            lessonId={lessonDeepDiveData.lessonId}
            unitLabel={lessonDeepDiveData.unitLabel}
            objectives={lessonDeepDiveData.objectives}
            onSubmitComplete={handleReflectionComplete}
            onNext={goToNext}
            initialValues={reflectionData}
          />
        );
      case 'pre-review':
        return (
          <PreReviewBox
            focusTopic={getFocusTopic(reflectionData)}
            onNext={goToNext}
          />
        );
      case 'intervention':
        return (
          <InterventionBox
            lessonId={lessonDeepDiveData.lessonId}
            lessonName={lessonDeepDiveData.lessonName}
            lessonSummary={lessonDeepDiveData.lessonSummary}
            vocabulary={lessonDeepDiveData.vocabulary}
            assessmentAnalysis={lessonDeepDiveData.assessmentAnalysis}
            objectives={lessonDeepDiveData.objectives}
            jsonVideos={lessonDeepDiveData.jsonVideos}
            reflectionData={reflectionData}
            onNext={goToNext}
          />
        );
      case 'pre-skills-check':
        return (
          <PreSkillsCheck onKeepPracticing={goToPrev} onTestSkills={goToNext} />
        );
      case 'skills-check':
        return (
          <SkillsCheck
            lessonId={lessonDeepDiveData.lessonId}
            lessonName={lessonDeepDiveData.lessonName}
            lessonSummary={lessonDeepDiveData.lessonSummary}
            vocabulary={lessonDeepDiveData.vocabulary}
            objectives={lessonDeepDiveData.objectives}
            reflectionData={reflectionData}
            onComplete={goToNext}
          />
        );
      case 'tutor-summary':
        return (
          <TutorSummaryBox nextLessonUrl={lessonDeepDiveData.nextLessonUrl} />
        );
    }
  };

  return (
    <div className={styles.container} data-theme={'Dark'}>
      {!isStoryScreen && (
        <div className={styles.progressBar} aria-hidden="true">
          <div
            className={styles.progressFill}
            style={{
              width: `${(currentIndex / (BOX_IDS.length - 1)) * 100}%`,
            }}
          />
        </div>
      )}
      <div className={styles.topNav}>
        <span className={styles.tutorWordmark}>Tutor+</span>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={goToPrev}
          aria-label="Previous"
          aria-hidden={isFirst}
          style={{visibility: isFirst ? 'hidden' : undefined}}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 14l5-5 5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={styles.box}>
        {renderBox()}
        {!isStoryScreen && (
          <div className={styles.dotsNav} aria-hidden="true">
            {BOX_IDS.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${
                  i === currentIndex ? styles.dotActive : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {!isLast &&
        !isStoryScreen &&
        currentScreenId !== 'intervention' &&
        currentScreenId !== 'pre-skills-check' &&
        currentScreenId !== 'skills-check' && (
          <div className={styles.bottomNav}>
            <FizzyButton
              onClick={handleContinue}
              ariaLabel="Next"
              className={styles.scrollCue}
            >
              Continue
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 10l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </FizzyButton>
          </div>
        )}
    </div>
  );
};

export default LessonDeepDiveContainer;
