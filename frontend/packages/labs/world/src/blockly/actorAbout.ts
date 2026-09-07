// Which KIND `this actor` and `event actor` are about, and the picture of it.
//
// Every other block that names a kind of actor shows one: a dropdown's options
// are pictures where the project has them (`moduleOptions.pictured`), because a
// kind of actor is a thing you can see and a row of names is a worse way to
// pick one. The two blocks that name an actor WITHOUT a dropdown were the
// exception, and they are the two a learner most often has to hold in their
// head — "which actor is `this actor` here?" is the question a handler asks and
// does not answer.
//
// It can be answered from where the block SITS, and only from there:
//
//   under `define actor`                     → that actor
//   in the body of `add actor ⟨Coin⟩`        → a Coin
//   in a hat whose subject is `any ⟨Crate⟩`  → a Crate
//   `event actor` under a hat filtered on ⟨Mark⟩ → a Mark
//   anywhere else                            → nobody knows
//
// THE LAST ROW IS THE IMPORTANT ONE. A block that shows a picture sometimes is
// only worth having if the rule for when is legible, and this one is: you get a
// picture exactly when something above the block says which kind. In a rule's
// trait step `this actor` is whatever elected the trait — a different answer per
// project — and in the toolbox it is nothing at all, so both keep the word.
//
// A picture is not a name, so the name rides along as the image's `alt` and the
// word beside it stays: `this ⟨picture⟩`, read aloud as "this Crate". The
// dropdowns could not do that — an option is an image or text, never both — and
// a block's message has room for the pair.

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {actorIconImage} from './actorIcons';
import {actorIcon, actorThumbnail} from './actorThumbnails';
import {editingActorModule} from './editingRule';
import {NAME_FIELD, NAMED} from './extensions/addActorName';
import {addOnChange, isStructuralChange} from './extensions/onChange';
import {localActorFor, localActorValue} from './localActors';
import {DEFINE_TWEEN, PLAY_TWEEN_HERE} from './tweens';

/** How big the picture is drawn on a block, square. */
const PICTURE = 20;
/** The fields the two blocks carry: the word, and the picture beside it. */
const WORD = 'WORD';
const PICTURE_FIELD = 'PIC';

/**
 * Which field of a hat holds its KIND filter, by block type.
 *
 * Registered where the hat is built (`domainBlocks.defineEventBlock`), because
 * that is the only place that knows: a hat's filter fields are numbered across
 * its parameters, and an enum filter and a kind filter look alike from here —
 * `FILTER0` is a key on `when ⟨space⟩ is pressed` and a kind on `when ⟨any
 * Crate⟩ starts touching ⟨Mark⟩`. Reading the value and guessing which it was
 * would be right until somebody named an actor "space".
 */
const kindFilters = new Map<string, string>();

/** Say that this hat's kind filter lives in this field. */
export function registerKindFilter(blockType: string, field: string): void {
  kindFilters.set(blockType, field);
}

/** The field a hat's kind filter is in, if it has one. */
export const kindFilterField = (blockType: string): string | undefined =>
  kindFilters.get(blockType);

/** An actor kind, as the thing that draws one needs it. */
export interface ActorAbout {
  /** The type a thumbnail is keyed by: a module path, or a world's own id. */
  type: string;
  /** What to call it — the `alt` a picture carries. */
  name: string;
}

/** As much of a block as reading its surroundings needs. */
interface Surroundings {
  type?: string;
  id?: string;
  getParent?: () => Surroundings | null;
  getFieldValue?: (name: string) => string | null;
  getInputTargetBlock?: (name: string) => Surroundings | null;
  workspace?: {getTopBlocks?: (ordered?: boolean) => Surroundings[]};
}

/**
 * The actor an `.actor` FILE is about.
 *
 * The case the walk cannot reach: a handler in an actor file is a ROOT beside
 * the definition rather than a row inside it, so `this actor` in one has no
 * `define actor` above it — and it is still that actor, because the file is
 * about one. The type is the file's (the workspace was told when it opened);
 * the name is on the definition, which is the only `define actor` there.
 */
const fileActor = (block: Surroundings): ActorAbout | undefined => {
  const module = editingActorModule(block as never);
  if (!module) {
    return undefined;
  }
  const root = block.workspace
    ?.getTopBlocks?.(false)
    .find(top => top.type === 'world_actor');
  return {type: module, name: root?.getFieldValue?.('NAME') || 'actor'};
};

/**
 * Whether this workspace is a WORLD.
 *
 * Which decides what a `define actor` root in it means: a world's own inline
 * actor, named by the block it is defined in, or the whole subject of an
 * `.actor` file, named by the file. Both are `world_actor` roots and
 * `localActorFor` answers for either — so asked in an actor file it says the
 * actor is called `Player`, which is a name no thumbnail is filed under.
 */
const definesWorld = (block: Surroundings): boolean =>
  (block.workspace?.getTopBlocks?.(false) ?? []).some(
    top => top.type === 'world_world',
  );

/** A dropdown value (`local:…` or a module path) as a kind. */
const kindOfValue = (
  block: Surroundings,
  value: string | null | undefined,
): ActorAbout | undefined => {
  if (!value) {
    return undefined;
  }
  const own = localActorFor(block as never, value);
  return own
    ? {type: own.type, name: own.name}
    : {type: value, name: value.split('/').pop() ?? value};
};

/** The kind a hat is about: its subject socket's `any ⟨Kind⟩`. */
const subjectOf = (hat: Surroundings): ActorAbout | undefined => {
  const kind = hat.getInputTargetBlock?.('ACTOR');
  return kind?.type === 'world_actor_kind'
    ? kindOfValue(hat, kind.getFieldValue?.('ACTOR'))
    : undefined;
};

/**
 * The kind of actor a block is about, or nothing when nothing says.
 *
 * Walks up rather than asking the workspace, because the answer is a fact about
 * where the block IS: the same `this actor` dragged from one handler to the next
 * is about a different kind, and dragged into a rule is about nobody in
 * particular.
 */
export function actorAbout(
  block: Surroundings,
  which: 'this' | 'event',
): ActorAbout | undefined {
  let child = block;
  for (
    let at = block.getParent?.();
    at;
    child = at, at = at.getParent?.() ?? null
  ) {
    const type = at.type ?? '';
    // `add actor ⟨Coin⟩ do:` binds the actor it places for the length of its
    // body, so `this actor` in there is a Coin. Two conditions, both of them
    // the generator's (extensions/addActorName):
    //
    //   the block is IN THE BODY, not chained after it — `add actor` twice in a
    //   row makes the second a `getParent` child of the first, and it places
    //   its own kind rather than living in anybody's scope;
    //
    //   and the block did not take a name. `as ⟨placed⟩` exists precisely so
    //   that a body can still say `this actor` and mean the actor whose file it
    //   is, so a picture of the placed kind there would be a lie.
    if (type === 'world_add_actor' && which === 'this') {
      if (
        child.id !== undefined &&
        at.getInputTargetBlock?.('DO')?.id === child.id &&
        at.getFieldValue?.(NAME_FIELD) !== NAMED
      ) {
        return kindOfValue(at, at.getFieldValue?.('ACTOR'));
      }
      continue;
    }
    if (type.startsWith('world_on_')) {
      if (which === 'this') {
        // A world's hat names a kind; an actor file's names `this actor`, and
        // then the answer is the file's own — so a subject that is not a kind
        // is not an answer of "nobody", it is no answer at all.
        return subjectOf(at) ?? fileActor(block);
      }
      const field = kindFilterField(type);
      return field ? kindOfValue(at, at.getFieldValue?.(field)) : undefined;
    }
    if (type === 'world_actor') {
      // A world's own `define actor`, or an `.actor` file's root. The first is
      // named by the block it is defined in; the second is the file, which the
      // workspace was told about when it opened (`editingRule`).
      if (which === 'event') {
        return undefined; // an actor file's handlers carry their own filter
      }
      return definesWorld(block)
        ? kindOfValue(at, localActorValue(at.id ?? ''))
        : fileActor(block);
    }
    // A rule says nothing about who elects it, and never can: `this actor` in a
    // trait step is whatever holds the trait, in this project and the next.
    if (type.startsWith('world_rule') || type === 'world_trait_step') {
      return undefined;
    }
    // A TWEEN IS A FUNCTION OF THE ACTOR IT IS PLAYED ON, not of the actor
    // whose file it sits in — the generator says so in as many words, and
    // `play tween ⟨…⟩ on ⟨who⟩` is what supplies the argument. So `this actor`
    // in here is the tween's subject and nobody knowable at edit time.
    //
    // Drawing the containing actor's picture on it was an outright lie, and
    // the Pad is where it read as one: its tweens fade whatever steps on it,
    // played on `event actor` from the pad's own handlers, and every `this
    // actor` inside them wore a picture of the pad.
    if (type === DEFINE_TWEEN || type === PLAY_TWEEN_HERE) {
      return undefined;
    }
  }
  // Nothing above it, which in an actor file is most of the file: a row under
  // `define actor` has the definition above it, and a handler beside one has
  // nothing at all.
  return which === 'this' ? fileActor(block) : undefined;
}

/** What a kind is drawn as: its elected symbol, else its picture, else nothing. */
export const actorPicture = (type: string): string | undefined =>
  actorIconImage(actorIcon(type) ?? '') ?? actorThumbnail(type);

/** Put the picture on the block, or take it off, as its surroundings say. */
function drawActor(block: Blockly.Block): void {
  const which = block.type === 'world_event_actor' ? 'event' : 'this';
  const input = block.inputList?.[0];
  if (!input) {
    return;
  }
  const about = actorAbout(block as never, which);
  const src = about && actorPicture(about.type);
  const word = input.fieldRow.find(field => field.name === WORD);
  const shown = input.fieldRow.find(field => field.name === PICTURE_FIELD);
  if (!src || !about) {
    if (shown) {
      input.removeField(PICTURE_FIELD);
    }
    word?.setValue(`${which} actor`);
    return;
  }
  word?.setValue(which);
  if (shown) {
    shown.setValue(src);
    (shown as Blockly.FieldImage).setAlt?.(about.name);
    return;
  }
  input.appendField(
    new Blockly.FieldImage(src, PICTURE, PICTURE, about.name),
    PICTURE_FIELD,
  );
}

/**
 * Keep that picture right: on creation, and whenever the block's surroundings
 * change.
 *
 * The same three things every context-reading extension here watches for — the
 * block being moved, the hat's dropdown being changed, and a thumbnail arriving
 * after the editor drew (`refreshActorPictures`, which the editor calls beside
 * `redrawLiveDropdowns` for exactly that).
 */
export const actorPictureExtension: Extension = defineExtension(
  'world_actor_picture',
  {
    extension() {
      const block = this as unknown as Blockly.Block;
      drawActor(block);
      // …and again once the load that made it has finished. A block is created
      // before it is connected to anything, and a SHADOW is created and never
      // announced — so the first draw of one asks an empty room what it is
      // about. Deferring by a tick is what `rgbaPreview` does with its own
      // ordering problem, and it is the same problem: the answer exists a
      // moment after the question is first askable.
      setTimeout(() => {
        if (!block.isDisposed?.()) {
          drawActor(block);
        }
      }, 0);
      addOnChange(block, function (this: Blockly.Block, event) {
        if (isStructuralChange(this, event)) {
          drawActor(this);
        }
      });
    },
  },
);

/** Redraw every actor picture on a workspace — see the extension. */
export function refreshActorPictures(workspace: Blockly.Workspace): void {
  for (const block of workspace.getAllBlocks(false)) {
    if (
      block.type === 'world_this_actor' ||
      block.type === 'world_event_actor'
    ) {
      drawActor(block);
    }
  }
}
