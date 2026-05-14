/**
 * Module-level store for the current set of world IDs, used by Blockly
 * dropdown fields (specifically the Game2_setWorld block).
 */

let worldIds: string[] = [];

export function setWorldIds(ids: string[]) {
  worldIds = ids.filter(id => typeof id === 'string' && id.length > 0);
}

export function getWorldOptions(): [string, string][] {
  if (worldIds.length === 0) {
    return [['(none)', '__none__']];
  }
  return worldIds.map(id => [id, id] as [string, string]);
}
