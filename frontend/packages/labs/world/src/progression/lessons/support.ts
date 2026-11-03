// Building a lesson's starting project.
//
// A lesson's project is small — a screen and its map, an actor or two, and whatever stock
// rules and pictures the lesson is about — and it is built the way a LEARNER'S
// project gets those things: by running the same import functions the dropdowns
// run (`importStockRule`, `importStockSprite`, `importStockActor`). So a rule's
// dependencies arrive because the importer brings them, not because a lesson
// remembered to list them, and nothing here can drift from what importing
// actually does.
//
// The folders are the starter's eight, always, whether or not the lesson uses
// them: a folder is what gives a file its meaning here — an image under
// `backgrounds/` is a backdrop and one under `sprites/` is not — and a learner
// who wants to upload a picture should not have to know that first.

import {activateFile} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {
  importStockAnimation,
  importStockSprite,
} from '../../appearance/importStock';
import {stockAnimation, stockSprite} from '../../appearance/stock';
import {buildProject, type ProjectSpec} from '../../constants';
import {importStockMap} from '../../maps/importStockMap';
import {stockMapById} from '../../maps/stock';
import {importStockRule} from '../../rules/importStockRule';
import {stockRule} from '../../rules/stock';

import type {LessonScreen} from './worlds';

/** The eight folders every World project has. */
export const LESSON_FOLDERS = [
  'rules',
  'screens',
  'actors',
  'sprites',
  'backgrounds',
  'maps',
  'effects',
] as const;

export interface LessonSpec {
  /**
   * The Main Screen, the map its Game Viewport shows and the actor files
   * beside them, as `screenFile` hands them over; or a screen with no level
   * of its own, whose Viewports show the lesson's `maps`.
   */
  screen: LessonScreen | {screen: string; map?: undefined; actors?: undefined};
  /**
   * Actor files, by stem: `hero` becomes `actors/hero.actor`.
   *
   * Beside the ones the screen spec listed, for an actor written out by hand
   * (`actors/actorDocument`). A stem given both ways is one file,
   * and this one wins.
   */
  actors?: Record<string, string>;
  /**
   * Rule files a lesson WRITES, by stem: `wind` becomes `rules/wind.rule`.
   *
   * Not `rules`, which imports one from the stock library. A Making lesson is
   * about a rule small enough to read in a sitting, and no stock rule is: they
   * are the library's, written to be used rather than to be a first thing
   * anybody opens.
   */
  ruleFiles?: Record<string, string>;
  /**
   * Map files, by stem: `room1` becomes `maps/room1.map`.
   *
   * The data a level is (`WorldMap` as JSON). One lesson has two of them, and
   * it is the lesson about there being two (`adventure/rooms`).
   */
  maps?: Record<string, string>;
  /** Stock rules to import, by id. Their dependencies come with them. */
  rules?: readonly string[];
  /** Stock sprites to import, by id. */
  sprites?: readonly string[];
  /** Stock animations to import, by id. Each brings the image it reads. */
  animations?: readonly string[];
  /** Stock actors to import, by id. Each brings its rules and pictures. */
  stockActors?: readonly string[];
  /**
   * Stock screens to import, by id: `pauseMenu` becomes
   * `screens/pauseMenu.screen`. Imported after the Main Screen, whose data
   * declares the events a screen raises (specs/SCREEN_STACK_PLAN.md).
   */
  stockScreens?: readonly string[];
}

/**
 * A lesson's project.
 *
 * `main.screen` is the active tab, because a lesson is about the game unless
 * it says otherwise, and the tab a learner lands on is the first thing the
 * lesson says to them. The actors the screen spec listed are open beside it,
 * so a learner asked to change the Hero reaches the Hero without a list of
 * files to find it in, and so is the level, since a lesson on the map is done
 * there: the screen draws it, but only as a picture (`MapStage`).
 */
export const lessonSource = (spec: LessonSpec): MultiFileSource => {
  const listed = spec.screen.actors ?? {};
  const files: ProjectSpec['files'] = {
    main: {
      name: 'main.screen',
      language: 'screen',
      contents: spec.screen.screen,
      folderId: 'screens',
      active: true,
      open: true,
    },
  };
  for (const [stem, contents] of Object.entries(listed)) {
    files[stem] = {
      name: `${stem}.actor`,
      language: 'actor',
      contents,
      folderId: 'actors',
      open: true,
    };
  }
  for (const [stem, contents] of Object.entries(spec.actors ?? {})) {
    files[stem] = {
      name: `${stem}.actor`,
      language: 'actor',
      contents,
      folderId: 'actors',
      // A tab too: an actor a lesson wrote out by hand is one it means the
      // learner to open, or it would have imported a stock one.
      open: true,
    };
  }
  if (spec.screen.map !== undefined) {
    files.level = {
      name: 'main.map',
      language: 'map',
      contents: spec.screen.map,
      folderId: 'maps',
      open: true,
    };
  }
  for (const [stem, contents] of Object.entries(spec.maps ?? {})) {
    files[stem] = {
      name: `${stem}.map`,
      language: 'map',
      contents,
      folderId: 'maps',
    };
  }
  for (const [stem, contents] of Object.entries(spec.ruleFiles ?? {})) {
    files[stem] = {
      name: `${stem}.rule`,
      language: 'rule',
      contents,
      folderId: 'rules',
    };
  }

  let source = buildProject({
    folders: [...LESSON_FOLDERS],
    files,
    open: [
      'main',
      ...Object.keys(listed),
      ...Object.keys(spec.actors ?? {}),
      ...(spec.screen.map === undefined ? [] : ['level']),
    ],
  }).source;

  // Order is deliberate: an actor may bring a rule, and a rule may already be
  // there, and every one of these refuses to overwrite what it finds. So a
  // lesson can name a rule its stock actor also needs without getting two.
  for (const id of spec.rules ?? []) {
    source = importStockRule(source, need(stockRule(id), 'rule', id)).source;
  }
  for (const id of spec.stockActors ?? []) {
    source = importStockActor(
      source,
      need(stockActorById(id), 'actor', id),
    ).source;
  }
  for (const id of spec.sprites ?? []) {
    source = importStockSprite(
      source,
      need(stockSprite(id), 'sprite', id),
    ).source;
  }
  for (const id of spec.animations ?? []) {
    source = importStockAnimation(
      source,
      need(stockAnimation(id), 'animation', id),
    ).source;
  }
  // The Viewport the Main Screen places.
  source = importStockActor(
    source,
    need(stockActorById('viewport'), 'actor', 'viewport'),
  ).source;
  for (const id of spec.stockScreens ?? []) {
    source = importStockMap(
      source,
      need(stockMapById(id), 'screen', id),
    ).source;
  }
  return source;
};

/** A stock item, or a thrown error naming what was asked for. */
const need = <T>(found: T | undefined, kind: string, id: string): T => {
  if (!found) {
    throw new Error(`no stock ${kind} called “${id}”`);
  }
  return found;
};

/**
 * The project with its level in front: a lesson whose task is on the map
 * opens there, and one whose work is in blocks on the Main Screen's code
 * (`levelData.worldView`).
 */
export function opensOnTheLevel(source: MultiFileSource): MultiFileSource {
  const level = Object.values(source.files).find(
    file => file.name === 'main.map',
  );
  return level ? activateFile(source, level.id) : source;
}
