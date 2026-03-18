/**
 * Module-level store for the current set of image names, used by
 * Blockly dropdown fields that need dynamic options.
 */

let imageNames: string[] = [];

export function setImageNames(names: string[]) {
  imageNames = names.filter(n => typeof n === 'string' && n.length > 0);
}

export function getImageOptions(): [string, string][] {
  if (imageNames.length === 0) {
    return [['(no images)', '__none__']];
  }
  return imageNames.map(name => [name, name] as [string, string]);
}
