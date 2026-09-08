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
import {COIN_ANIMATION, coinActor} from './coin';
import {GROUND_SPRITE, groundActor} from './ground';
import {healthBarActor} from './healthBar';
import {labelActor} from './label';
import {PLAYER_ANIMATION, playerActor} from './player';
import {PORTRAIT_SPRITE, portraitActor} from './portrait';
import {progressBarActor} from './progressBar';
import {speechBoxActor} from './speechBox';
import {textInputActor} from './textInput';

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
   * stores `Writing#ShowsTextTrait`, and splitting that string to find
   * "Writing" would work until a trait reference changed shape. The names are
   * short and the list is two long; saying them is cheaper than parsing them.
   */
  requires: readonly string[];
  /**
   * The stock ANIMATIONS the workspace plays, by id.
   *
   * Brought with the actor for the reason the rules are. A `play animation`
   * field holds an id the project's own `.anim` files define, so one naming an
   * animation the project lacks is a field whose value is not among its
   * options — which resolves to something else or to nothing, and says so
   * nowhere. Each animation brings the image its frames read.
   */
  animations?: readonly string[];
  /**
   * The stock SPRITES the workspace names, by id.
   *
   * For an actor with a still picture. One whose picture is an animation needs
   * nothing here — the animation carries its own strip.
   */
  sprites?: readonly string[];
  /**
   * The stock ACTORS this one acts LIKE, by id.
   *
   * `acts like ⟨actors/progressBar⟩` stores a module path, and a path naming a
   * file the project does not hold is a row that imports nothing: the actor
   * loses the traits, the picture and the per-frame work it was supposed to
   * inherit, silently. So the parent comes with the child — the same bargain
   * `requires` makes for a rule, one level up.
   */
  actors?: readonly string[];
  /** The `.actor` workspace JSON, copied verbatim on import. */
  contents: string;
}

export const STOCK_ACTORS: readonly StockActor[] = [
  {
    id: 'label',
    name: 'Label',
    description:
      'A word on the screen. Give it text, a size, a color and an anchor, and it draws them — the smallest way for a game to say anything to the player.',
    // NOTHING. The words, their size, their color and their anchor are the
    // Label's own `define property` rows — they were the Writing rule, which
    // had four properties and no behavior at all (specs/UI_ACTORS.md).
    requires: [],
    contents: labelActor,
  },
  {
    id: 'progressBar',
    name: 'Progress Bar',
    description:
      'A bar that fills up. Set its fraction between 0 and 1 and it draws that much of itself — health, a loading bar, how close a boss is to waking. Attach it to an actor to have it ride above one.',
    // NOTHING. The fraction and the two colors are the bar's own `define
    // property` rows — it was a rule with three properties and no behavior,
    // which is a file and a shelf row standing between a learner and three
    // declarations they can read in the actor that uses them.
    requires: [],
    contents: progressBarActor,
  },
  {
    id: 'healthBar',
    name: 'Health Bar',
    description:
      'A bar that fills itself in. Point it at an actor with “subject” and it shows how much health that actor has left. Put it in the corner for a HUD, or add “Attached” to have it ride above the actor it is about.',
    // HEALTH ALONE, for what it READS. The health belongs to the actor this
    // bar is pointed at, and a `world_get_Health_…` block in a project without
    // that rule is one the palette never mints — the file then fails to
    // generate with nothing on screen saying why.
    //
    // Everything a bar IS arrives with the bar it acts like: the fraction it
    // fills to and the two colors it fills with are the Progress Bar's own
    // `define property` rows now, where they used to be a rule this had to
    // ask for as well.
    //
    // NOT Attachment: where a bar sits is the project's business. One over an
    // enemy's head elects it too; one in the corner of the screen does not.
    requires: ['Health'],
    // …and the bar it IS. `acts like ⟨actors/progressBar⟩` names a module
    // path, and a path naming a file the project lacks inherits nothing at all
    // — no trait, no picture — which is a Health Bar that draws as a plain box
    // and says so nowhere.
    actors: ['progressBar'],
    contents: healthBarActor,
  },
  {
    id: 'button',
    name: 'Button',
    description:
      'A label you can press. It raises “is clicked with” on itself, so a handler needs no hit test of its own.',
    // Mouse for the click, and nothing else: the words it paints are the
    // Label's own properties, which arrive with the Label it acts like.
    requires: ['Mouse'],
    // …and the Label it IS, which is where the words, their size and the box
    // they are laid into come from.
    actors: ['label'],
    contents: buttonActor,
  },
  {
    id: 'textInput',
    name: 'Text Input',
    description:
      'A line the player types into. Click it or tab to it, and what is typed goes in — with a caret after the last letter, and the words sliding left once they no longer fit.',
    // Input for what was TYPED, which is not a list of keys; Mouse so a click
    // can choose it; and Tab Navigation for the focus itself, which is a fact
    // about the screen rather than about any one field (specs/UI_ACTORS.md).
    requires: ['Input', 'Mouse', 'Tab Navigation'],
    actors: ['label'],
    contents: textInputActor,
  },
  {
    id: 'speechBox',
    name: 'Speech Box',
    description:
      'A panel with room for a sentence — what a line of dialogue is read from. It types itself out: say a line and the letters arrive at reading pace.',
    // Time for the clock its letters arrive on, and the Label it IS, which is
    // where the words, the colors and the box come from.
    requires: ['Time'],
    actors: ['label'],
    contents: speechBoxActor,
  },
  {
    id: 'portrait',
    name: 'Portrait',
    description:
      'The face of whoever is speaking. It starts invisible, so a scene fades it in when its turn comes and out again when it passes.',
    // No rule at all: a picture and two tweens, and a tween is not a rule.
    requires: [],
    sprites: [PORTRAIT_SPRITE],
    contents: portraitActor,
  },
  {
    id: 'coin',
    name: 'Coin',
    description:
      'A spinning coin that can be picked up. It knows nothing about points — who may collect it, and what that is worth, are the game\u2019s to say.',
    // Collection alone, which arrives with Collisions of its own accord: "Can
    // Be Collected" requires "Can Collide", and a trait brings its
    // dependencies. NOT Scoring — see the note in `coin.ts`.
    requires: ['Collection'],
    animations: [COIN_ANIMATION],
    contents: coinActor,
  },
  {
    id: 'player',
    // The GAME it assumes, in the name: this one walks left and right, jumps,
    // and falls, which is the wrong player for a top-down game. See the note
    // in `player.ts`. The id stays `player` — it is the file's stem, and the
    // lessons that place one name it.
    name: 'Platformer Player',
    description:
      'Somebody to be in a side-view game. Walks left and right with the arrow keys, jumps with the space bar, and falls when there is nothing under it \u2014 which is why it comes with a Ground.',
    // Jumping pulls Gravity, and Arrow Keys pulls Physics: three named rules
    // leave five in the project. What the entry names is what the FILE says,
    // and the rule importer works out the rest.
    requires: ['Jumping', 'Arrow Keys', 'Input'],
    animations: [PLAYER_ANIMATION],
    contents: playerActor,
  },
  {
    id: 'ground',
    name: 'Ground',
    description:
      'A tile that holds things up and cannot be walked through. The other half of the Platformer Player \u2014 gravity with nothing to land on is a long fall.',
    requires: ['Gravity', 'Solid Bodies'],
    sprites: [GROUND_SPRITE],
    contents: groundActor,
  },
];

/** One by id, for an importer that knows which it wants. */
export const stockActorById = (id: string): StockActor | undefined =>
  STOCK_ACTORS.find(actor => actor.id === id);
