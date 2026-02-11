import {Button} from '@code-dot-org/component-library/button';
import {
  BodyFourText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import LessonRecommendedAction from './LessonRecommendedAction';

import styles from './LessonFeedback.module.scss';

interface LessonFeedbackProps {
  feedbackText: string | undefined;
  lessonId: number;
  teacherName: string | null;
  submittedAtDate: string | Date;
}

interface LessonData {
  lessonName: string;
  lessonLink: string;
  isLoading: boolean;
  error: string | null;
}

function LessonFeedback({
  feedbackText,
  lessonId,
  submittedAtDate,
  teacherName,
}: LessonFeedbackProps) {
  const [data, setData] = useState<LessonData>({
    lessonName: '',
    lessonLink: '',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [lessonResponse] = await Promise.all([
          fetch(`/lessons/${lessonId}/lesson_feedback_data`),
        ]);

        const lessonData = lessonResponse.ok ? await lessonResponse.json() : {};

        setData({
          lessonName: lessonData.name || '',
          lessonLink: lessonData.start_url || '',
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load lesson data',
        }));
      }
    }

    if (lessonId) {
      fetchData();
    }
  }, [lessonId]);

  const formattedDate = new Date(submittedAtDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleGoToLesson = () => {
    if (data.lessonLink) {
      window.open(data.lessonLink, '_blank');
    }
  };

  if (data.isLoading) {
    return (
      <div className={styles.lessonFeedbackContainer}>
        <BodyFourText>Loading lesson details...</BodyFourText>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className={styles.lessonFeedbackContainer}>
        <BodyFourText>Error: {data.error}</BodyFourText>
      </div>
    );
  }

  return (
    <div className={styles.lessonFeedbackContainer}>
      <div className={styles.lessonFeedbackHeader}>
        <div className={styles.lessonFeedbackContent}>
          <Heading5 className={styles.lessonFeedbackHeading}>
            {data.lessonName}
          </Heading5>

          <BodyFourText className={styles.lessonFeedbackDetails}>
            Sent by {teacherName || 'Your teacher'} on {formattedDate}
          </BodyFourText>
        </div>

        <Button
          onClick={handleGoToLesson}
          text="Go to Lesson"
          type="secondary"
          size="s"
          iconRight={{iconName: 'arrow-up-right-from-square'}}
          color="gray"
          disabled={!data.lessonLink}
        />
      </div>
      <hr className={styles.lessonFeedbackDivider} />
      <div className={styles.lessonFeedbackBox}>{feedbackText}</div>
      <hr className={styles.lessonFeedbackDivider} />
      {/* TODO: Add in real data here */}
      <LessonRecommendedAction
        resourceComment="Review the lesson and complete the exercises to improve your understanding."
        resourceLink={data.lessonLink}
      />
    </div>
  );
}

export default LessonFeedback;
