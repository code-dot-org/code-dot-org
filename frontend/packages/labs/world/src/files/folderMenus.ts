// What each of a project's folders is FOR, as a menu.
//
// A World project's folders are semantic. A picture is a backdrop because it is
// in `backgrounds/` and a sprite because it is in `sprites/`; a `.rule` is a
// rule wherever it sits, but everything the editor offers assumes it is in
// `rules/`. So the tree's central affordance — drag a file somewhere else — is
// a move that either means nothing or breaks something, and the tree spends its
// space on hierarchy a project never has: nine folders, one level, no nesting.
//
// This is the other reading of the same project. One button per folder, each
// saying what that folder is for, holding the two ways to get a new one (make
// it, or take one from the shelf) and the files already there. The tree remains
// one toggle away for anyone who wants the whole project at once.
//
// WHAT IS MISSING FROM A ROW IS THE POINT. A folder with no `makes` is one
// where making a file from nothing means nothing: a sprite is bytes and a sound
// is bytes, and an empty one of either is not a starting point. A folder with
// no `shelf` is one nobody stocks: nothing ships a world or a map to import.

import {requestActorImport} from '../actors/actorImport';
import {requestAppearanceImport} from '../appearance/appearanceImport';
import {requestEffectImport} from '../blockly/effectImport';
import {requestRuleImport} from '../blockly/ruleImport';
import {requestSoundImport} from '../sound/soundImport';

/** One kind of file a folder's `New` can make. */
export interface Makeable {
  /** What the menu item says — "New actor". */
  label: string;
  /** The extension it gets, which is what decides its editor. */
  extension: string;
}

export interface FolderMenu {
  /** The folder's name, which is the whole of what makes a file its kind. */
  folder: string;
  /** What the button is called, for its tooltip and its label. */
  label: string;
  /** Its icon — the file browser's icon for that kind, where there is one. */
  icon: string;
  /** What `New` may make here, in the order offered. Empty means it may not. */
  makes: readonly Makeable[];
  /** The shelf `Import…` opens, when something stocks this kind. */
  shelf?: () => Promise<string | undefined>;
}

/**
 * The buttons, left to right, in the order a project is built up in.
 *
 * Worlds and actors first because that is what a game IS; then the rules that
 * give them behaviour; then what they look and sound like; then the two
 * documents — a map is a world's arrangement and an effect is a picture's.
 */
export const FOLDER_MENUS: readonly FolderMenu[] = [
  {
    folder: 'worlds',
    label: 'Worlds',
    icon: 'earth-americas',
    makes: [{label: 'New world', extension: 'world'}],
  },
  {
    folder: 'actors',
    label: 'Actors',
    icon: 'masks-theater',
    makes: [{label: 'New actor', extension: 'actor'}],
    shelf: requestActorImport,
  },
  {
    folder: 'rules',
    label: 'Rules',
    icon: 'scroll',
    // Two, because a `.behavior` is a rule with one trait said in one block
    // (specs/BEHAVIORS.md) — a different thing to reach for, in the same
    // folder.
    makes: [
      {label: 'New rule', extension: 'rule'},
      {label: 'New behavior', extension: 'behavior'},
    ],
    shelf: requestRuleImport,
  },
  {
    folder: 'sprites',
    label: 'Sprites',
    icon: 'image',
    makes: [],
    shelf: () => requestAppearanceImport('sprite'),
  },
  {
    folder: 'backgrounds',
    label: 'Backgrounds',
    icon: 'mountain-sun',
    makes: [],
    shelf: () => requestAppearanceImport('background'),
  },
  {
    folder: 'animations',
    label: 'Animations',
    icon: 'film',
    makes: [{label: 'New animation', extension: 'anim'}],
    shelf: () => requestAppearanceImport('animation'),
  },
  {
    folder: 'sounds',
    label: 'Sounds',
    icon: 'volume-high',
    makes: [],
    shelf: requestSoundImport,
  },
  {
    folder: 'effects',
    label: 'Effects',
    icon: 'wand-sparkles',
    makes: [{label: 'New effect', extension: 'effect'}],
    shelf: requestEffectImport,
  },
  {
    folder: 'maps',
    label: 'Maps',
    icon: 'map',
    makes: [{label: 'New map', extension: 'map'}],
  },
];
