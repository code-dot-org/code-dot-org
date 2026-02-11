import React from 'react';

import LessonFeedback from '@cdo/apps/templates/feedback/LessonFeedback';
import i18n from '@cdo/locale';

// In the future we should delete the saved_feedback, but as of now there is no "submitted" feedback
interface LessonFeedbackData {
  id?: number;
  submitted_feedback?: string;
  lesson_id: number;
  saved_feedback?: string;
  updated_at: string | Date;
  teacher_id: number;
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

  React.useEffect(() => {
    async function fetchAllLessonFeedback(studentId: number) {
      try {
        const response = await fetch(
          `/lesson_feedbacks/by_student/${studentId}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch AI lesson feedback: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        const sortedData = data.sort(
          (a: LessonFeedbackData, b: LessonFeedbackData) => {
            const dateA = new Date(a.updated_at).getTime();
            const dateB = new Date(b.updated_at).getTime();
            return dateB - dateA; // Sort descending (most recent first)
          }
        );
        setFetchedFeedback(sortedData);
        return sortedData;
      } catch (err) {
        console.error('AI lesson feedback error:', err);
        return null;
      }
    }
    if (studentId) {
      fetchAllLessonFeedback(studentId);
    }
  }, [studentId]);

  return (
    <div>
      {!!fetchedFeedback && fetchedFeedback?.length === 0 && (
        <div>{i18n.feedbackNoneYet()}</div>
      )}
      {fetchedFeedback &&
        fetchedFeedback.length > 0 &&
        fetchedFeedback.map((lessonFeedback, i) => {
          return (
            <LessonFeedback
              key={i}
              feedbackText={lessonFeedback?.saved_feedback}
              lessonId={lessonFeedback.lesson_id}
              teacherId={lessonFeedback.teacher_id}
              submittedAtDate={lessonFeedback.updated_at}
            />
          );
        })}
    </div>
  );
}

export default LessonFeedbackContainer;
