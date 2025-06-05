import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

interface StudentWorkRequest {
  numSamples?: number;
  unitId: number;
  levelId: number;
  studentIds?: string[];
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
      const errorData = await response.json();
      const msg = `Network response was not ok fetching student code samples: ${JSON.stringify(
        errorData,
        null,
        2
      )}`;
      console.error(msg);
      return null;
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
