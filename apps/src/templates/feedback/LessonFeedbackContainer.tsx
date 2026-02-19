import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import LessonFeedback from '@cdo/apps/templates/feedback/LessonFeedback';
import i18n from '@cdo/locale';

interface LessonFeedbackData {
  id: number;
  submitted_feedback?: string;
  lesson_id: number;
  updated_at: string | Date;
  teacher_name?: string;
  teacher_id: number;
  lesson_title?: string;
  lesson_start_url?: string;
  resources?: Array<{
    recommended_action?: string;
    resource_name?: string;
    resource_link?: string;
  }>;
}

interface LessonFeedbackContainerProps {
  studentId: number | null;
}

function LessonFeedbackContainer({studentId}: LessonFeedbackContainerProps) {
  const [fetchedFeedback, setFetchedFeedback] = React.useState<
    LessonFeedbackData[] | null
  >(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function fetchAllLessonFeedback() {
      try {
        setIsLoading(true);
        const response = await fetch(`/lesson_feedbacks/by_student`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch AI lesson feedback: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setFetchedFeedback(data);
        return data;
      } catch (err) {
        console.error('AI lesson feedback error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    }
    if (studentId) {
      fetchAllLessonFeedback();
    }
  }, [studentId]);

  const hasSubmittedFeedback =
    fetchedFeedback &&
    fetchedFeedback.length > 0 &&
    fetchedFeedback.some(item => !!item.submitted_feedback);

  return (
    <div>
      {isLoading && <Spinner size={'large'} />}
      {!hasSubmittedFeedback && !isLoading && (
        <div>{i18n.feedbackNoneYet()}</div>
      )}
      {hasSubmittedFeedback &&
        fetchedFeedback &&
        !isLoading &&
        fetchedFeedback
          .filter(lessonFeedback => !!lessonFeedback.submitted_feedback)
          .map(lessonFeedback => {
            return (
              <LessonFeedback
                key={lessonFeedback.id}
                feedbackText={lessonFeedback?.submitted_feedback}
                lessonId={lessonFeedback.lesson_id}
                teacherName={lessonFeedback.teacher_name || 'Your teacher'}
                submittedAtDate={lessonFeedback.updated_at}
                lessonTitle={lessonFeedback.lesson_title}
                lessonStartUrl={lessonFeedback.lesson_start_url}
                resource={lessonFeedback.resources?.[0]}
              />
            );
          })}
    </div>
  );
}

export default LessonFeedbackContainer;
