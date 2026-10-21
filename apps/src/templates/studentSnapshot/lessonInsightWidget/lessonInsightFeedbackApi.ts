export interface LessonInsightFeedback {
  unitId: number;
  lessonId: number;
  studentId: number;
  sectionId: number;
  // null clears a previously submitted rating.
  thumbsUp: boolean | null;
}

// Stub: no endpoint exists yet. Replace the body with a POST when it does.
export async function submitLessonInsightFeedback(
  feedback: LessonInsightFeedback
): Promise<void> {
  console.debug('Lesson insight feedback (not sent):', feedback);
}
