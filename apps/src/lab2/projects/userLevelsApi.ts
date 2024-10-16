import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

export async function getPredictResponse(
  levelId: number,
  scriptId: number
): Promise<string | null> {
  try {
    const response = await HttpClient.fetchJson<{data: string}>(
      `/user_levels/level_source/${scriptId}/${levelId}`,
      {}
    );
    // The program is the predict response.
    return response.value?.data;
  } catch (e) {
    if (e instanceof NetworkError) {
      // If we hit a network error, it could mean there is no logged-in user
      // or we had some other issue.
      // In this case, just return null rather than crashing the page.
      return null;
    }
    throw e;
  }
}

export async function resetPredictLevelProgress(
  currentLevelId: string | null,
  scriptId: number | null
) {
  return await HttpClient.post(
    '/delete_predict_level_progress',
    JSON.stringify({
      script_id: scriptId,
      level_id: currentLevelId,
    }),
    true,
    {'Content-Type': 'application/json'}
  );
}

export async function getSectionSummary(sectionId: number, levelId: string) {
  try {
    return await HttpClient.fetchJson<{
      response_count: number;
      num_students: number;
    }>(`/user_levels/section_summary/${sectionId}/${levelId}`, {});
  } catch (e) {
    if (e instanceof NetworkError) {
      // If we hit a network error, it could mean there is no logged-in user
      // or we had some other issue.
      // In this case, just return null rather than crashing the page.
      return null;
    }
    throw e;
  }
}
