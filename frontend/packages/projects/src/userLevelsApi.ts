import {retrieveToken} from '@code-dot-org/user';

export async function getPredictResponse(
  levelId: number,
  scriptId: number
): Promise<string | null> {
  const response = await fetch(`/user_levels/level_source/${scriptId}/${levelId}`);
  if (!response.ok) {
    // If we hit a network error, it could mean there is no logged-in user
    // or we had some other issue.
    // In this case, just return null rather than crashing the page.
    return null;
  }
  const json = await response.json();
  const value: {data: string} = json;
  // The program is the predict response.
  return value.data;
}

export async function resetPredictLevelProgress(
  currentLevelId: string | null,
  scriptId: number | null
): Promise<Response> {
  return fetch('/delete_predict_level_progress', {
    method: 'POST',
    body: JSON.stringify({
      script_id: scriptId,
      level_id: currentLevelId,
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': await retrieveToken(),
    },
  });
}

export async function getSectionSummary(sectionId: number, levelId: string): Promise<{
  response_count: number;
  num_students: number;
} | null> {
  const response = await fetch(`/user_levels/section_summary/${sectionId}/${levelId}`);
  if (!response.ok) {
    // If we hit a network error, it could mean there is no logged-in user
    // or we had some other issue.
    // In this case, just return null rather than crashing the page.
    return null;
  }
  const json = await response.json();
  const value: {
    response_count: number;
    num_students: number;
  } = json;
  // The program is the predict response.
  return value;
}
