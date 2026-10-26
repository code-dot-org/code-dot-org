// What each of a project's folders holds: the kind of file it is, what a new
// one of that kind is made as, whether one can be uploaded into it, and the
// icon the kind wears.
//
// A World project's folders are semantic. A picture is a backdrop because it is
// in `backgrounds/` and a sprite because it is in `sprites/`; a `.rule` is a
// rule wherever it sits, but everything the editor offers assumes it is in
// `rules/`. So a folder is a KIND, and this is the list of kinds.
//
// It was the list of folder buttons along the top of the workspace, one per
// folder, which were the last way to browse a project's files. They are gone
// (specs/SHELL_FINISH_PLAN.md, step 5): each kind is reached where it is used —
// a picture from the look that shows it, an effect from the Effects tab, a
// rule from Rules in Play — and those doors ask the file acts to make, upload,
// rename, clone or delete (`files/fileActs`, answered by `FileMenus`). What
// the acts need to know about a folder is here: what `make` makes in it, and
// whether `upload` may put a file there. The icons are still the kinds' own,
// read by the progression's unlock list (`progression/TileDetail`).
//
// WHAT IS MISSING FROM A ROW IS THE POINT. A folder with no `makes` is one
// where making a file from nothing means nothing: a SOUND is bytes, and an
// empty one is silence nobody can draw.
//
// A blank picture IS a starting point: an empty PNG is not one for a game and
// is exactly one for a drawing, which is what the image editor exists to fill
// in — so "New picture" writes a blank tile and opens it (`files/newThing`).

import {BACKGROUNDS_FOLDER} from '../appearance/backgroundsFolder';

/**
 * The actors' folder, named because the file acts write actors into it
 * (`FileMenus`).
 */
export const ACTORS_FOLDER = 'actors';
/** …and the world's, which holds exactly one file (specs/MAP_EVENTS_PLAN.md). */
export const WORLDS_FOLDER = 'worlds';
/**
 * …and the screens', whose Main Screen is the game in the shape that
 * replaces a world (specs/SCREEN_MAP_PLAN.md, step 4).
 */
export const SCREENS_FOLDER = 'screens';

/**
 * The sprites' folder: the pictures an actor may look like, which `set
 * sprite` names and its open button opens (`blockly/extensions/openSourceButton`).
 */
export const SPRITES_FOLDER = 'sprites';

// The backdrops' folder is NOT declared here: it is a rule about which images
// are backdrops rather than a path, and it is read by the dropdowns and the
// importer as well (`appearance/backgroundsFolder`).
export {BACKGROUNDS_FOLDER};

/** One kind of file a folder's `make` can make. */
export interface Makeable {
  /** What the name prompt is titled — "New actor". */
  label: string;
  /** The extension it gets, which is what decides its editor. */
  extension: string;
  /** What to type, which is a NAME: the file's stem is made from it. */
  placeholder: string;
}

export interface FolderMenu {
  /** The folder's name, which is the whole of what makes a file its kind. */
  folder: string;
  /** What the kind is called, in the plural. */
  label: string;
  /** The kind's icon, as the file icons and the unlock list draw it. */
  icon: string;
  /** What `make` may make here, the first by default. Empty means it may not. */
  makes: readonly Makeable[];
  /**
   * Whether a file of the learner's own can be brought in here.
   *
   * The pictures and the sounds: what a learner has on their machine that this
   * lab can use (`worldConfig.validMimeTypes`). An upload lands in THIS folder,
   * which is what decides whether a PNG is a sprite or a backdrop — where the
   * file tree's upload always put one at the root.
   */
  uploads?: boolean;
}

/**
 * Screens, made from the map editor's switcher (`mapEditor/PlaceHeading`).
 * Apart from the list below because no unlock is a screen.
 */
export const SCREENS_MENU: FolderMenu = {
  folder: SCREENS_FOLDER,
  label: 'Screens',
  icon: 'display',
  makes: [{label: 'New screen', extension: 'screen', placeholder: 'Title'}],
};

/**
 * The kinds, in the order a project is built up in: a world, then the
 * pictures, because they come before the things made out of them; then the
 * actors, the rules that give them behavior, and the sounds; then the maps,
 * and the effects and themes a picture is drawn through. (No animations: an
 * animation is an actor's own, specs/ANIMATION_PLAN.md.)
 */
export const FOLDER_MENUS: readonly FolderMenu[] = [
  {
    // ONE WORLD PER PROJECT. A world is a whole PROGRAM — nothing composes
    // them, and the compiler has one entry — so levels, screens and dialogs
    // are maps, and `make` makes no second world (specs/MAP_EVENTS_PLAN.md).
    folder: WORLDS_FOLDER,
    label: 'World',
    icon: 'planet-ringed',
    makes: [],
  },
  {
    folder: SPRITES_FOLDER,
    label: 'Sprites',
    icon: 'image',
    makes: [{label: 'New sprite', extension: 'png', placeholder: 'Chaser'}],
    uploads: true,
  },
  {
    folder: BACKGROUNDS_FOLDER,
    label: 'Backgrounds',
    icon: 'mountain-sun',
    makes: [{label: 'New background', extension: 'png', placeholder: 'Cave'}],
    uploads: true,
  },
  {
    folder: ACTORS_FOLDER,
    label: 'Actors',
    icon: 'masks-theater',
    // Made by the Actor Creator, which asks more than a name
    // (`actors/create/actorCreate`); this is what a plain `make` would be.
    makes: [{label: 'New actor', extension: 'actor', placeholder: 'Chaser'}],
  },
  {
    folder: 'rules',
    label: 'Rules',
    icon: 'scroll',
    makes: [{label: 'New rule', extension: 'rule', placeholder: 'Gravity'}],
  },
  {
    folder: 'sounds',
    label: 'Sounds',
    icon: 'volume-high',
    makes: [],
    uploads: true,
  },
  {
    folder: 'effects',
    label: 'Effects',
    icon: 'wand-sparkles',
    makes: [{label: 'New effect', extension: 'effect', placeholder: 'Ripple'}],
  },
  {
    folder: 'maps',
    label: 'Maps',
    icon: 'map',
    makes: [{label: 'New map', extension: 'map', placeholder: 'Level 2'}],
  },
  {
    folder: 'styles',
    label: 'Themes',
    icon: 'palette',
    makes: [{label: 'New theme', extension: 'style', placeholder: 'Midnight'}],
  },
];
