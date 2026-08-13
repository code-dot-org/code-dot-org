// The stock actor library — actors a learner can import into a project.
//
// The counterpart to the stock RULE library (`rules/stock`), and it exists
// because interface elements are actors: a Label is an actor that elects one
// trait and draws one thing, and so is something a project can simply hold
// (specs/UI_ACTORS.md). There is nothing else to be — a widget would be a
// second scene graph, a second serialization and a second editor, for things
// that differ from actors only in being drawn in screen space, which is what a
// layer already says.
//
// Importing copies the workspace into `actors/<id>.actor`, where it is theirs:
// openable, editable, and no longer connected to anything here.

import {buttonActor} from './button';
import {labelActor} from './label';

/** One entry in the library. */
export interface StockActor {
  /** File stem this is imported as — `label` becomes `actors/label.actor`. */
  id: string;
  /** What the actor is, matching its `define actor` NAME — "Label". */
  name: string;
  /** One line on what it is, for the import dialog. */
  description: string;
  /**
   * The stock RULES it elects traits from, by rule name.
   *
   * Read as names rather than derived from the workspace: a `use trait` field
   * stores `Text#ShowsTextTrait`, and splitting that string to find "Text"
   * would work until a trait reference changed shape. The names are short and
   * the list is two long; saying them is cheaper than parsing them.
   */
  requires: readonly string[];
  /** The `.actor` workspace JSON, copied verbatim on import. */
  contents: string;
}

export const STOCK_ACTORS: readonly StockActor[] = [
  {
    id: 'label',
    name: 'Label',
    description:
      'A word on the screen. Give it text, a size, a color and an anchor, and it draws them — the smallest way for a game to say anything to the player.',
    requires: ['Text'],
    contents: labelActor,
  },
  {
    id: 'button',
    name: 'Button',
    description:
      'A label you can press. It raises “is clicked with” on itself, so a handler needs no hit test of its own.',
    requires: ['Text', 'Mouse'],
    contents: buttonActor,
  },
];

/** One by id, for an importer that knows which it wants. */
export const stockActorById = (id: string): StockActor | undefined =>
  STOCK_ACTORS.find(actor => actor.id === id);
