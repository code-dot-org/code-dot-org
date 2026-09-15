// What a stock actor LOOKS like, before you have one.
//
// The import dialog says what each actor is in a sentence. A sentence is not a
// picture of a speech box, and a learner choosing between a Label, a Button and
// a Speech Box is choosing between three pictures.
//
// SO IT DRAWS THE ACTOR'S OWN DRAWING, read out of the file by the reader the
// map editor also uses (`drawingReader`), over the shelf's files as though
// they were a project: every stock actor and every stock rule, so an `acts
// like` and a read of a rule's property resolve exactly as they would once
// imported. The DRIVER'S OWN painter then paints the commands
// (`runtime/driver/paintDrawing`), so the preview and the game are one
// painter.
//
// WHY NOT RUN THE ACTOR. Because running one means compiling a module, which is
// the sandbox's job and a second or so of esbuild — for a picture of a thing
// nobody has imported yet.
//
// A POSTER, NOT A SCREENSHOT, in exactly one place. A Health Bar reads the
// health of the actor it is POINTED AT, and points at nobody until a project
// wires it up — so its honest picture is an empty track, which advertises
// nothing. The reader answers "is anybody there?" with yes and reads the
// Health rule's own defaults, which is the bar a learner will see the moment
// they point it at something.

import {STOCK_RULES} from '../../rules/stock';
import {STOCK_ACTORS, type StockActor} from '../stock';

import {readDrawing, type ReadDrawing} from './drawingReader';

/** The drawing a preview paints. */
export type PreviewDrawing = ReadDrawing;

/** The shelf as a project's files, built once: nine actors ask the same. */
let shelf: Record<string, string> | undefined;
const shelfFiles = (): Record<string, string> => {
  if (!shelf) {
    shelf = {};
    for (const actor of STOCK_ACTORS) {
      shelf[`actors/${actor.id}.actor`] = actor.contents;
    }
    for (const rule of STOCK_RULES) {
      shelf[`rules/${rule.id}.rule`] = rule.contents;
    }
  }
  return shelf;
};

/**
 * The drawing a stock actor declares, as commands — or nothing for an actor
 * that wears a picture instead (`ActorPreview` shows that picture).
 */
export function previewDrawing(actor: StockActor): PreviewDrawing | undefined {
  return readDrawing(shelfFiles(), `actors/${actor.id}`);
}
