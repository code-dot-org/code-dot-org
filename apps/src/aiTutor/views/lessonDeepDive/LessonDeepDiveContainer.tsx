import {
  LevelsAttemptedBox,
  PersonalizedWelcomeBox,
  PreReviewBox,
  PreSkillsCheck,
  TimeSpentBox,
  TutorSummaryBox,
  ValidatedLevelsBox,
  WelcomeBox,
} from '@code-dot-org/lesson-deep-dive';
import {LessonObjectiveReflectionValues} from '@code-dot-org/shared-constants';
import React, {FC, useCallback, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import FizzyButton from './FizzyButton';
import ReflectionBox from './Reflection/ReflectionBox';
import InterventionBox from './ReviewModalities/InterventionBox';
import SkillsCheck from './SkillsCheck/SkillsCheck';
import {LessonDeepDiveData, ReflectionData, ReflectionValue} from './types';

import styles from './lesson-deep-dive-container.module.scss';

const BOX_IDS = [
  'welcome',
  'personalized-welcome',
  'levels-attempted',
  'time-spent',
  'validated-levels',
  'reflection',
  'pre-review',
  'intervention',
  'pre-skills-check',
  'skills-check',
  'tutor-summary',
] as const;

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
  const displayName = useAppSelector(
    state => state.currentUser.displayName as string | undefined
  );

  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, BOX_IDS.length - 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

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

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === BOX_IDS.length - 1;

  const renderBox = () => {
    switch (BOX_IDS[currentIndex]) {
      case 'welcome':
        return <WelcomeBox onNext={goToNext} />;
      case 'personalized-welcome':
        return (
          <PersonalizedWelcomeBox
            lessonName={lessonDeepDiveData.lessonName}
            unitLabel={lessonDeepDiveData.unitLabel}
            displayName={displayName}
          />
        );
      case 'levels-attempted':
        return (
          <LevelsAttemptedBox
            lessonName={lessonDeepDiveData.lessonName}
            levelsAttempted={
              lessonDeepDiveData.progressCounts.levelsAttemptedCount
            }
            levelsTotal={lessonDeepDiveData.progressCounts.levelsTotalCount}
          />
        );
      case 'time-spent':
        return (
          <TimeSpentBox
            lessonName={lessonDeepDiveData.lessonName}
            timeSpentSeconds={lessonDeepDiveData.timeSpentSeconds}
          />
        );
      case 'validated-levels':
        return (
          <ValidatedLevelsBox
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
      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{
            width: `${(currentIndex / (BOX_IDS.length - 1)) * 100}%`,
          }}
        />
      </div>
      <div className={styles.topNav}>
        <span className={styles.tutorWordmark}>Tutor+</span>
        {!isFirst && (
          <button
            type="button"
            className={styles.arrowButton}
            onClick={goToPrev}
            aria-label="Previous"
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
        )}
      </div>

      <div className={styles.box}>
        {renderBox()}
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
      </div>

      {!isLast &&
        BOX_IDS[currentIndex] !== 'intervention' &&
        BOX_IDS[currentIndex] !== 'pre-skills-check' &&
        BOX_IDS[currentIndex] !== 'skills-check' && (
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
