export type ProfileCompletion = 'all' | 'some' | 'none';
export type ProfileCorrectness = 'all' | 'some' | 'none' | 'na';

export type LessonStudentProfile = {
  completion: ProfileCompletion;
  correctness: ProfileCorrectness;
};

export async function fetchLessonStudentProfile(
  lessonId: number
): Promise<LessonStudentProfile> {
  const response = await fetch(`/api/v1/lessons/${lessonId}/student_profile`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lesson student profile: ${response.status}`);
  }
  return response.json() as Promise<LessonStudentProfile>;
}
