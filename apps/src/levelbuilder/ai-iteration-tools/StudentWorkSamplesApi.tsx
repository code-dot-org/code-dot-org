import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

interface StudentWorkRequest {
  includeAiEvaluations: boolean;
  numSamples: number;
  unitId: number;
  levelId: number;
}

export async function fetchStudentCodeSamples(
  studentWorkRequest: StudentWorkRequest
): Promise<string | null> {
  try {
    const response = await fetch(`/student_code_samples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(studentWorkRequest),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student code samples:', error);
    return null;
  }
}

export async function fetchFreeResponseAnswers(
  studentWorkRequest: StudentWorkRequest
): Promise<string | null> {
  try {
    const response = await fetch(`/free_response_answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(studentWorkRequest),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching free response answers:', error);
    return null;
  }
}
