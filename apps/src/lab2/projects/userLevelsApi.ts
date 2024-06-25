import HttpClient from '@cdo/apps/util/HttpClient';

const rootUrl = (levelId: number, scriptId: number) =>
  `/user_levels/level_source/${scriptId}/${levelId}`;

export async function getPredictResponse(
  levelId: number,
  scriptId: number
): Promise<string | null> {
  const response = await HttpClient.fetchJson<{data: string}>(
    rootUrl(levelId, scriptId),
    {}
  );
  // The program is the predict response.
  return response.value?.data;
}
