// Naming the actor `add actor` places, where there is another actor to shadow.
//
// `add actor` compiles to a block scope with its own `const actor`, so inside
// its body `this actor` is the NEW actor. That is the only reading a `.world`
// file needs — there is no other actor to mean — but in an `.actor` file it
// shadows the one whose blocks these are, and "put a bullet in front of me"
// cannot be written at all: both `this actor`s are the bullet, and the
// arithmetic silently reads the bullet's own position twice.
//
// Choosing `as ⟨name⟩` binds the new actor to a variable instead, which leaves
// `this actor` meaning what it means everywhere else in the file.
//
// THE CHOICE APPEARS ONLY WHERE IT MEANS SOMETHING. A world describing its
// level has nothing to shadow, so the block reads `add actor ⟨Coin⟩` there and
// the row is not built at all. Dragged under a `define actor` or into an
// actor's event handler the choice appears, and dragged back out it goes. That
// is `setOnChange`, the seam `worldContextExtension` warns through — a rebuild
// rather than a warning, because there is nothing WRONG with the block out of
// context; the option simply has nothing to mean there.
//
// OPTIONAL, and the default has to stay silent. A permanent variable field
// would load with its default name on every `add actor` ever saved, silently
// rebinding bodies that say `this actor` and mean it. `saveExtraState` returns
// nothing when unnamed, so those blocks serialize exactly as they did.
//
// A block that HAS chosen a name keeps its choice wherever it sits, even
// somewhere the choice would not be offered. Hiding a decision already made
// would change what the block compiles to without anyone touching it.

import {Blockly, defineExtension, defineMutator} from '@code-dot-org/blockly';

import {ActorVariable} from '../typedVariables';

export const ADD_ACTOR_NAME_MUTATOR = 'add_actor_name_mutator';
export const ADD_ACTOR_NAME_EXTENSION = 'world_add_actor_name';

/** The dropdown that chooses the reading, and the variable it governs. */
export const NAME_FIELD = 'NAMED';
export const VAR_FIELD = 'VAR';

/** The two readings, as the dropdown stores them. */
export const AS_THIS_ACTOR = 'this';
export const NAMED = 'named';

/**
 * Reads as a sentence either way: "add actor ⟨Bullet⟩ as this actor", or
 * "add actor ⟨Bullet⟩ as ⟨placed⟩". `this` first, so a dropdown built with no
 * stored value falls back to the reading every saved block was written under.
 */
export const NAME_OPTIONS: Array<[string, string]> = [
  ['as this actor', AS_THIS_ACTOR],
  ['as', NAMED],
];

/** Whether this block names what it places — read by the generator. */
export function namesPlacedActor(block: Blockly.Block): boolean {
  return block.getFieldValue(NAME_FIELD) === NAMED;
}

/**
 * Whether some enclosing block binds an actor this one would shadow.
 *
 * Ordinary parents rather than `getSurroundParent`, for the reason `layerOf`
 * documents in reverse: `define actor` has no `do` mouth, so being chained
 * below it IS being inside it.
 *
 * Which makes CHAINED and CONTAINED two different things, and `add actor` is
 * where the difference bites: its body is a `do` mouth, so a block inside it
 * shadows, and a block merely chained after it does not. Two `add actor`s in a
 * row are siblings — neither is in the other, and neither has anything to
 * shadow — but `getParent` on the second returns the first, so a walk that did
 * not ask HOW it got there offered a choice that could not mean anything.
 * `getInputWithBlock` is the question: it names the input holding a block, and
 * answers null for one that arrived through `next`.
 *
 * The walk STOPS at the first thing that binds a subject rather than looking
 * only for the ones that bind an actor. A handler rebinds the name, so a block
 * inside one is not in the context of whatever encloses the hat, however far
 * up that goes.
 */
export function hasEnclosingActor(block: Blockly.Block): boolean {
  let child = block;
  for (
    let parent = block.getParent();
    parent;
    child = parent, parent = parent.getParent()
  ) {
    // `define actor` binds `actor` for its whole chain, and a trait's members
    // are the subject's — both give a body an actor of its own.
    if (parent.type === 'world_actor' || parent.type === 'world_rule_trait') {
      return true;
    }
    // An unnamed spawn binds `actor` for what it CONTAINS, so a spawn inside a
    // spawn has one to shadow. Chained after it is not inside it. A named one
    // binds a variable and leaves the question to whatever encloses IT.
    if (parent.type === 'world_add_actor') {
      const inside = parent.getInputWithBlock?.(child) != null;
      if (inside && !namesPlacedActor(parent)) {
        return true;
      }
      continue;
    }
    // A hat. An actor-scoped event carries an ACTOR subject socket and binds
    // it; a world event's hat binds only `world`. Either way the walk ends.
    if (parent.type.startsWith('world_on_')) {
      return parent.getInput('ACTOR') !== null;
    }
    // Roots that bind something that is not an actor.
    if (parent.type === 'world_world' || parent.type === 'world_rule') {
      return false;
    }
  }
  return false;
}

interface AddActorNameState {
  named?: boolean;
}

export const addActorNameMutator = defineMutator(ADD_ACTOR_NAME_MUTATOR, {
  saveExtraState(): AddActorNameState {
    // Nothing at all when unnamed, so a block that never used this serializes
    // byte-for-byte as it did before the field existed.
    return namesPlacedActor(this) ? {named: true} : {};
  },

  loadExtraState(state: AddActorNameState): void {
    // The dropdown before the value: a saved named block is loaded before it is
    // connected to anything, so the context test would say no and there would
    // be no field to set.
    this.syncNameChoice_(Boolean(state?.named));
    if (state?.named) {
      this.setFieldValue(NAMED, NAME_FIELD);
    }
    this.syncPlacedName_();
  },

  /**
   * Show or hide the choice itself, by context.
   *
   * Rebuilt rather than skipped in the headless generator workspace, for the
   * reason `effectParamsMutator` gives: the generator READS these fields, so a
   * workspace that loaded the block without building them fails before a line
   * of code is generated. A dropdown and a variable field are both things the
   * offscreen renderer can make.
   */
  syncNameChoice_(force = false): void {
    const wanted = force || namesPlacedActor(this) || hasEnclosingActor(this);
    const present = this.getField(NAME_FIELD) !== null;
    if (wanted === present) {
      return;
    }
    const input = this.inputList[0];
    if (!input) {
      return;
    }
    if (wanted) {
      input.appendField(new Blockly.FieldDropdown(NAME_OPTIONS), NAME_FIELD);
    } else {
      input.removeField(NAME_FIELD, true);
    }
  },

  /** Add or remove the variable, to match the choice. */
  syncPlacedName_(): void {
    const wanted = namesPlacedActor(this);
    const present = this.getField(VAR_FIELD) !== null;
    if (wanted === present) {
      return;
    }
    const input = this.inputList[0];
    if (!input) {
      return;
    }
    if (wanted) {
      input.appendField(
        // Typed to Actor, so the getter it makes only plugs into Actor sockets
        // and its dropdown offers no loop variable of another flavour. Named
        // `placed` rather than the flavour's `other`: what it holds is the
        // thing just put into the world.
        new Blockly.FieldVariable(
          'placed',
          undefined,
          [ActorVariable.type],
          ActorVariable.type,
        ),
        VAR_FIELD,
      );
    } else {
      input.removeField(VAR_FIELD, true);
    }
  },
});

/**
 * Keep the block's shape matching where it sits.
 *
 * A JSON field carries no validator and `defineMutator` has no init hook, so
 * both wirings live here — the same split `effectParamsMutator` uses.
 */
export const addActorNameExtension = defineExtension(ADD_ACTOR_NAME_EXTENSION, {
  extension() {
    const self = this as unknown as {
      syncNameChoice_: (force?: boolean) => void;
      syncPlacedName_: () => void;
    };
    // Re-shape when the block's place in the tree could have changed — the
    // guard `worldContextExtension` uses, and for the same reasons: a flyout
    // block has no context to read, a UI event changes nothing structural, and
    // mid-drag the tree is a state nobody asked for.
    this.setOnChange(function (this: Blockly.Block) {
      const workspace = this.workspace as Blockly.WorkspaceSvg;
      if (this.isInFlyout || workspace?.isDragging?.()) {
        return;
      }
      self.syncNameChoice_();
      self.syncPlacedName_();
    });
    self.syncNameChoice_();
    self.syncPlacedName_();
  },
});
