import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const rootUrl = (levelId: number, scriptId: number) =>
  `/user_levels/level_source/${scriptId}/${levelId}`;

export async function getPredictResponse(
  levelId: number,
  scriptId: number
): Promise<string | null> {
  try {
    const response = await HttpClient.fetchJson<{data: string}>(
      rootUrl(levelId, scriptId),
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
  currentLevelId: string,
  scriptId: number
) {
  await HttpClient.post(
    '/delete_predict_level_progress',
    JSON.stringify({
      script_id: scriptId,
      level_id: currentLevelId,
    }),
    true,
    {'Content-Type': 'application/json'}
  );
}
