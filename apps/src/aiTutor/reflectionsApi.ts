import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

export const saveUserLessonReflection = async (
  lessonId: number,
  success: string,
  struggle: string
): Promise<void> => {
  const response = await fetch('/user_lesson_reflections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify({lesson_id: lessonId, success, struggle}),
  });
  if (!response.ok) {
    throw new Error(`Failed to save lesson reflection: ${response.status}`);
  }
};

export const saveUserLessonObjectiveReflection = async (
  objectiveId: string,
  reflection: string
): Promise<void> => {
  const response = await fetch('/user_lesson_objective_reflections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': await getAuthenticityToken(),
    },
    body: JSON.stringify({objective_id: objectiveId, reflection}),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to save objective reflection: ${response.status}`
    );
  }
};
