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
// where making a file from nothing means nothing: a SOUND is bytes, and an
// empty one is silence nobody can draw. A folder with no `shelf` is one nobody
// stocks: nothing ships a world or a map to import.
//
// Sprites and backdrops were in the first list and are not any more. An empty
// PNG is not a starting point for a game and IS one for a drawing — it is what
// the image editor exists to fill in — so "New sprite" writes a blank tile and
// opens it (`files/newThing`).

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
  /** What to type, which is a NAME: the file's stem is made from it. */
  placeholder: string;
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
  /**
   * Whether a file here can be GIVEN something rather than only made,
   * imported or deleted.
   *
   * Only the actors, and it is not on this menu: enhancing is done TO an
   * actor, so it is offered on that actor's own row beside Rename and Clone,
   * which is where everything else done to one file lives
   * (`actors/enhance`).
   */
  enhances?: boolean;
  /**
   * Whether a file of your own can be brought in here.
   *
   * The pictures and the sounds: what a learner has on their machine that this
   * lab can use (`worldConfig.validMimeTypes`). An upload lands in THIS folder,
   * which is what decides whether a PNG is a sprite or a backdrop — where the
   * file tree's upload always put one at the root, and left the learner to
   * work out why their sky was in the sprite list.
   */
  uploads?: boolean;
}

/**
 * The buttons, left to right, in the order a project is built up in.
 *
 * Worlds and actors first because that is what a game IS; then the rules that
 * give them behavior; then what they look and sound like; then the two
 * documents — a map is a world's arrangement and an effect is a picture's.
 */
export const FOLDER_MENUS: readonly FolderMenu[] = [
  {
    folder: 'worlds',
    label: 'Worlds',
    icon: 'planet-ringed',
    makes: [{label: 'New world', extension: 'world', placeholder: 'My World'}],
  },
  {
    folder: 'actors',
    label: 'Actors',
    icon: 'masks-theater',
    makes: [{label: 'New actor', extension: 'actor', placeholder: 'Chaser'}],
    shelf: requestActorImport,
    enhances: true,
  },
  {
    folder: 'rules',
    label: 'Rules',
    icon: 'scroll',
    makes: [{label: 'New rule', extension: 'rule', placeholder: 'Gravity'}],
    shelf: requestRuleImport,
  },
  {
    folder: 'sprites',
    label: 'Sprites',
    icon: 'image',
    // A blank one to draw on, which is what the image editor is for. It was
    // "making one from nothing means nothing" until the seed existed; what an
    // empty PNG is not is a *starting point for a game*, and it is exactly the
    // starting point for a drawing (`files/newThing`).
    makes: [{label: 'New sprite', extension: 'png', placeholder: 'Chaser'}],
    shelf: () => requestAppearanceImport('sprite'),
    uploads: true,
  },
  {
    folder: 'backgrounds',
    label: 'Backgrounds',
    icon: 'mountain-sun',
    makes: [{label: 'New background', extension: 'png', placeholder: 'Cave'}],
    shelf: () => requestAppearanceImport('background'),
    uploads: true,
  },
  {
    folder: 'animations',
    label: 'Animations',
    icon: 'film',
    makes: [
      {label: 'New animation', extension: 'anim', placeholder: 'Coin Spin'},
    ],
    shelf: () => requestAppearanceImport('animation'),
  },
  {
    folder: 'sounds',
    label: 'Sounds',
    icon: 'volume-high',
    makes: [],
    shelf: requestSoundImport,
    uploads: true,
  },
  {
    folder: 'effects',
    label: 'Effects',
    icon: 'wand-sparkles',
    makes: [{label: 'New effect', extension: 'effect', placeholder: 'Ripple'}],
    shelf: requestEffectImport,
  },
  {
    folder: 'maps',
    label: 'Maps',
    icon: 'map',
    makes: [{label: 'New map', extension: 'map', placeholder: 'Level 2'}],
  },
];
