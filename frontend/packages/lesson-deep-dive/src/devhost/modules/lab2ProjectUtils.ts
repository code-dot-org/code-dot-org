// @cdo/apps/lab2/projects/utils
//
// Both flags come from levelbuilder-only appOptions the dev host never sets,
// so the canvas always runs in plain student mode.

export function getIsStartMode(): boolean {
  return false;
}

export function getAppOptionsEditingExemplar(): boolean | undefined {
  return undefined;
}
