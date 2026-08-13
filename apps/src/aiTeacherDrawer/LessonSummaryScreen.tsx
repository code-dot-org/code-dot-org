import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import {THREAD_TYPES} from '@cdo/apps/aiDifferentiation/constants';
import {fetchThreadMessages} from '@cdo/apps/aiDifferentiation/redux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

import {SuggestedLesson} from './SectionPodcastCard';

import styles from './lesson-summary-screen.module.scss';

interface LessonSummaryInfo {
  learning_objective: string;
  lesson_beats: string[];
  misconceptions: string[];
  tips: string[];
}

interface LessonSummaryScreenProps {
  lesson: SuggestedLesson;
  sectionName: string;
  onBack: () => void;
  onNavigateToChats?: () => void;
}

const LessonSummaryScreen: React.FC<LessonSummaryScreenProps> = ({
  lesson,
  sectionName,
  onBack,
  onNavigateToChats,
}) => {
  const dispatch = useAppDispatch();
  const [summary, setSummary] = useState<LessonSummaryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!lesson.lesson_id) {
      setIsLoading(false);
      setHasError(true);
      return;
    }
    setIsLoading(true);
    setHasError(false);
    setSummary(null);
    HttpClient.fetchJson<{lesson_summary: string}>(
      `/ai_lesson_summaries/show?lesson_id=${lesson.lesson_id}`
    )
      .then(response => {
        if (response.response.ok && response.value?.lesson_summary) {
          setSummary(JSON.parse(response.value.lesson_summary));
        } else {
          setHasError(true);
        }
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [lesson.lesson_id]);

  const handleAskAITA = () => {
    dispatch(
      fetchThreadMessages({
        contextType: AiDiffContext.LESSON,
        thread: 0,
        threadType: THREAD_TYPES.lessonSummaryHelp,
        curriculumCourses: [],
      })
    );
    onNavigateToChats?.();
  };

  const showFooter = !isLoading && !hasError && !!summary;

  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <FontAwesomeV6Icon iconName="chevron-left" />
          Back
        </button>
      </div>

      <div className={styles.scrollContent}>
        <div className={styles.header}>
          {lesson.name && (
            <span className={styles.lessonLabel}>{lesson.name}</span>
          )}
          <h2 className={styles.mainHeading}>Teaching Tips</h2>
        </div>
        {isLoading ? (
          <div className={styles.centered}>
            <Spinner size="medium" />
          </div>
        ) : hasError || !summary ? (
          <div className={styles.centered}>
            No lesson summary is available for this lesson.
          </div>
        ) : (
          <div className={styles.sections}>
            {summary.misconceptions?.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Common Misconceptions</p>
                <ul className={styles.list}>
                  {summary.misconceptions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.tips?.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Differentiation Tips</p>
                <ul className={styles.list}>
                  {summary.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.lesson_beats?.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Key Lesson Beats</p>
                <ul className={styles.list}>
                  {summary.lesson_beats.map((beat, i) => (
                    <li key={i}>{beat}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.learning_objective && (
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Learning Objective</p>
                <p className={styles.paragraph}>{summary.learning_objective}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showFooter && (
        <div className={styles.footer}>
          <MuiButton
            variant="outlined"
            color="secondary"
            size="medium"
            className={styles.askButton}
            onClick={handleAskAITA}
            type="button"
          >
            Questions? Ask AI Teaching Assistant
          </MuiButton>
        </div>
      )}
    </div>
  );
};

export default LessonSummaryScreen;
