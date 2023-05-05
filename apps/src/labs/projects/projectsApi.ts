const rootUrl = '/projects/';

// Given a levelId, get the project identifier (channel id) for that level.
export async function getForLevel(
  levelId: string,
  scriptName?: string
): Promise<Response> {
  let requestString = `${rootUrl}level/${levelId}`;
  if (scriptName) {
    requestString += `?scriptName=${scriptName}`;
  }
  return fetch(requestString);
}
