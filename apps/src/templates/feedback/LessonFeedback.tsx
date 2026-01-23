import {Button} from '@code-dot-org/component-library/button';
import {
  BodyFourText,
  Heading5,
} from '@code-dot-org/component-library/typography';
import React from 'react';

interface LessonFeedbackProps {
  feedbackText: string;
  lessonName: string;
  lessonNumber: number;
  lessonLink: string;
  submittedAtDate: string | Date;
  teacherName: string;
}

function LessonFeedback({
  feedbackText,
  lessonName,
  lessonNumber,
  lessonLink,
  submittedAtDate,
  teacherName,
}: LessonFeedbackProps) {
  const formattedDate = new Date(submittedAtDate).toLocaleDateString();

  const handleGoToLesson = () => {
    window.open(lessonLink, '_blank');
  };

  return (
    <div style={styles.container}>
      <Heading5 style={styles.heading}>
        {lessonName} - Lesson {lessonNumber}
      </Heading5>

      <BodyFourText style={styles.details}>
        Teacher: {teacherName} • Submitted: {formattedDate}
      </BodyFourText>

      <Button
        onClick={handleGoToLesson}
        style={styles.button}
        text="Go to Lesson"
      />

      <div style={styles.feedbackBox}>{feedbackText}</div>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: 24,
  },
  heading: {
    marginBottom: 8,
  },
  details: {
    marginBottom: 16,
    color: '#666',
  },
  button: {
    marginBottom: 16,
  },
  feedbackBox: {
    padding: 16,
    border: '1px solid #ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    lineHeight: 1.5,
  },
};

export default LessonFeedback;
