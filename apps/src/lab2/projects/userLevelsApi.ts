import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const rootUrl = (levelId: number, scriptId?: number) =>
  `/user_levels/program/${levelId}/${scriptId}`;

export async function getProgram(
  levelId: number,
  scriptId?: number
): Promise<string | null> {
  try {
    const response = await HttpClient.fetchJson<{program: string}>(
      rootUrl(levelId, scriptId),
      {}
    );
    return response.value.program;
  } catch (e) {
    if (e instanceof NetworkError && e.response.status === 404) {
      // There was no program for this user and level, which is an expected case.
      return null;
    }
    throw e;
  }
}
