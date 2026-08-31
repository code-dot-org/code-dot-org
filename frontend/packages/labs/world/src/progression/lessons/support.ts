// Building a lesson's starting project.
//
// A lesson's project is small — a world, an actor or two, and whatever stock
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

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {
  importStockAnimation,
  importStockSprite,
} from '../../appearance/importStock';
import {stockAnimation, stockSprite} from '../../appearance/stock';
import {buildProject, type ProjectSpec} from '../../constants';
import {importStockRule} from '../../rules/importStockRule';
import {stockRule} from '../../rules/stock';

/** The eight folders every World project has. */
export const LESSON_FOLDERS = [
  'rules',
  'worlds',
  'actors',
  'animations',
  'sprites',
  'backgrounds',
  'maps',
  'effects',
] as const;

export interface LessonSpec {
  /** The `.world` file, as a Blockly workspace. */
  world: string;
  /** Actor files, by stem: `hero` becomes `actors/hero.actor`. */
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
  /** Stock rules to import, by id. Their dependencies come with them. */
  rules?: readonly string[];
  /** Stock sprites to import, by id. */
  sprites?: readonly string[];
  /** Stock animations to import, by id. Each brings the image it reads. */
  animations?: readonly string[];
  /** Stock actors to import, by id. Each brings its rules and pictures. */
  stockActors?: readonly string[];
}

/**
 * A lesson's project.
 *
 * `main.world` is the open file and the active tab, because a lesson is about
 * the world unless it says otherwise, and the tab a learner lands on is the
 * first thing the lesson says to them.
 */
export const lessonSource = (spec: LessonSpec): MultiFileSource => {
  const files: ProjectSpec['files'] = {
    main: {
      name: 'main.world',
      language: 'world',
      contents: spec.world,
      folderId: 'worlds',
      active: true,
      open: true,
    },
  };
  for (const [stem, contents] of Object.entries(spec.actors ?? {})) {
    files[stem] = {
      name: `${stem}.actor`,
      language: 'actor',
      contents,
      folderId: 'actors',
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
    open: ['main'],
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
  return source;
};

/** A stock item, or a thrown error naming what was asked for. */
const need = <T>(found: T | undefined, kind: string, id: string): T => {
  if (!found) {
    throw new Error(`no stock ${kind} called “${id}”`);
  }
  return found;
};
