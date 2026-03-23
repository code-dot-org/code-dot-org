/**
 * Module-level store for the current set of item entries, used by
 * Blockly dropdown fields that need dynamic options.
 */

import {Game2ItemType} from '../types';

interface ItemEntry {
  name: string;
  itemType: Game2ItemType;
}

let itemEntries: ItemEntry[] = [];

export function setItemEntries(
  entries: {name: string; itemType?: Game2ItemType}[]
) {
  itemEntries = entries
    .filter(e => typeof e.name === 'string' && e.name.length > 0)
    .map(e => ({name: e.name, itemType: e.itemType ?? 'sprite'}));
}

/** Backwards-compatible setter — treats all as sprites. */
export function setItemNames(names: string[]) {
  setItemEntries(names.map(n => ({name: n, itemType: 'sprite'})));
}

function entriesToOptions(entries: ItemEntry[]): [string, string][] {
  if (entries.length === 0) {
    return [['(none)', '__none__']];
  }
  return entries.map(e => [e.name, e.name] as [string, string]);
}

/** All sprite-type items (for createItem, setItemBehavior, etc). */
export function getSpriteOptions(): [string, string][] {
  return entriesToOptions(itemEntries.filter(e => e.itemType === 'sprite'));
}

/** All background-type items (for setBackground). */
export function getBackgroundOptions(): [string, string][] {
  return entriesToOptions(itemEntries.filter(e => e.itemType === 'background'));
}

/** Sprite and block items (for remove, whenCollide, etc). */
export function getSpriteAndBlockOptions(): [string, string][] {
  return entriesToOptions(
    itemEntries.filter(e => e.itemType === 'sprite' || e.itemType === 'block')
  );
}

/** All items regardless of type (legacy fallback). */
export function getImageOptions(): [string, string][] {
  return entriesToOptions(itemEntries);
}
