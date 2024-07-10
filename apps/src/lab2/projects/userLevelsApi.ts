import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const rootUrl = (levelId: number, scriptId: number) =>
  `/user_levels/${scriptId}/${levelId}`;

interface UserLevelResponse {
  user_level: UserLevel;
}

export interface UserLevel {
  id: number;
  level_id: number;
  script_id: number;
  user_id: number;
  attempts: number;
  submitted: boolean;
  created_at: string;
  updated_at: string;
  best_result: number;
  level_source_id: number;
  readonly_answers: boolean | null;
  time_spent: number;
  unlocked_at: string | null;
  deleted_at: string | null;
}

export async function getPredictResponse(
  levelId: number,
  scriptId: number
): Promise<string | null> {
  try {
    const response = await HttpClient.fetchJson<{data: string}>(
      `${rootUrl(levelId, scriptId)}/level_source`,
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

export async function getUserLevel(
  levelId: number,
  scriptId: number
): Promise<UserLevel | null> {
  try {
    const response = await HttpClient.fetchJson<UserLevelResponse>(
      rootUrl(levelId, scriptId),
      {}
    );
    return response.value?.user_level;
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
