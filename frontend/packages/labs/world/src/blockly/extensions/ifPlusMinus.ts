// `if` grows by button, not by bubble.
//
// Blockly's own `controls_if` is the canonical bubble mutator: the ⚙ opens a
// mini-workspace, and `else if` and `else` are blocks you drag into a stack
// inside it. Learners do not find it, and the ones who do have to understand a
// second workspace before they can write a second branch. So the extension the
// block names — `controls_if_mutator` — is REPLACED here with one that reshapes
// the block from a `+` on its first row and a `−` on each branch, which is what
// the legacy labs do (`apps/src/blockly/addons/plusMinusBlocks/if`).
//
// Replacing the extension rather than redefining the block is what keeps this
// small. `controls_if` is Blockly's, registered natively along with its
// JavaScript generator (see the note in `domainBlocks`), and an extension is
// applied to each block as it is CONSTRUCTED — so swapping the registration
// changes every `if` from then on without touching the definition, the
// generator, or the toolbox entry.
//
// NOTHING SAVED CHANGES SHAPE. Blockly writes this block's extra state as
// `{elseIfCount, hasElse}` and so does this, deliberately: a project saved by
// either mutator opens under the other, and the fixtures in `src/fixtures`
// needed no rewriting. The `+`/`−` is a way of editing the block, not a
// different block.
//
// WHAT `+` GIVES YOU, IN ORDER, is the legacy behaviour and it is worth saying
// out loud because it is not obvious: the first press adds `else`, and every
// press after that adds an `else if` ABOVE it. The reasoning is that a learner
// reaching for a second branch usually wants "otherwise", and the ordering
// keeps `else` where it must be — last — without anybody having to move it.
// `if … else if` with no `else` is still reachable: press `+` twice and take
// the `else` away with its own `−`.

import * as Blockly from 'blockly/core';
import type {BlockSvg} from 'blockly/core';

import {minusField, plusField} from './plusMinus';

/** The extension `controls_if` names in its own definition. */
const CONTROLS_IF_MUTATOR = 'controls_if_mutator';

/** What this block's extra state says, which is what Blockly's own says. */
interface ControlsIfState {
  elseIfCount?: number;
  hasElse?: boolean;
}

/**
 * The block, as this mutator sees it.
 *
 * `elseIfCount_` is 1-BASED where it names inputs: the sockets are `IF1`/`DO1`
 * upward, because `IF0`/`DO0` are the `if` itself and belong to the definition.
 */
type ControlsIfBlock = BlockSvg &
  ControlsIfMutator & {
    elseIfCount_: number;
    hasElse_: boolean;
  };

interface ControlsIfMutator {
  saveExtraState(this: ControlsIfBlock): ControlsIfState | null;
  loadExtraState(this: ControlsIfBlock, state: ControlsIfState): void;
  plus(this: ControlsIfBlock): void;
  minus(this: ControlsIfBlock, index?: number): void;
  updateShape_(this: ControlsIfBlock, target: number): void;
  updateElse_(this: ControlsIfBlock, wanted: boolean): void;
  addElse_(this: ControlsIfBlock): void;
  addElseIf_(this: ControlsIfBlock): void;
  removeElse_(this: ControlsIfBlock): void;
  removeElseIf_(this: ControlsIfBlock, index?: number): void;
}

const controlsIfMutator = {
  elseIfCount_: 0,
  hasElse_: false,

  /**
   * Nothing at all for a plain `if`, so that the commonest block in any project
   * carries no `extraState` — which is also what Blockly's own mutator does,
   * and the reason a file written by one is byte-identical under the other.
   */
  saveExtraState(this: ControlsIfBlock): ControlsIfState | null {
    if (!this.elseIfCount_ && !this.hasElse_) {
      return null;
    }
    return {
      ...(this.elseIfCount_ ? {elseIfCount: this.elseIfCount_} : {}),
      ...(this.hasElse_ ? {hasElse: true} : {}),
    };
  },

  /**
   * Make the block match the state, in BOTH directions.
   *
   * Loading is not only what happens when a file opens. Undo replays a
   * `mutation` event by handing the block its OLD state, so this is also how a
   * pressed `+` is taken back — and a load that can only add would leave the
   * branch behind and the counter disagreeing with the block. The legacy
   * version has exactly that hole, which is why the `else` is reconciled here
   * rather than merely created.
   *
   * The `else` is settled first so that an `else if` arriving after it can put
   * it back at the bottom, which is the one thing about this block's shape that
   * is not negotiable.
   */
  loadExtraState(this: ControlsIfBlock, state: ControlsIfState): void {
    this.updateElse_(Boolean(state.hasElse));
    this.updateShape_(state.elseIfCount ?? 0);
  },

  /** The `+`: an `else` if there is not one yet, an `else if` after that. */
  plus(this: ControlsIfBlock): void {
    if (this.hasElse_) {
      this.addElseIf_();
    } else {
      this.addElse_();
    }
  },

  /**
   * The `−` on a branch: the `else if` numbered `index`, or the `else`.
   *
   * Each branch carries its own, so what is removed is the row the button sits
   * on and never a guess. A press on a branch that is already gone is ignored
   * rather than allowed to run off the end — a stale click can arrive after an
   * undo has taken the row away.
   */
  minus(this: ControlsIfBlock, index?: number): void {
    if (index === undefined) {
      if (this.hasElse_) {
        this.removeElse_();
      }
      return;
    }
    if (index >= 1 && index <= this.elseIfCount_) {
      this.removeElseIf_(index);
    }
  },

  /** Add or remove `else if` rows until there are `target` of them. */
  updateShape_(this: ControlsIfBlock, target: number): void {
    while (this.elseIfCount_ < target) {
      this.addElseIf_();
    }
    while (this.elseIfCount_ > target) {
      this.removeElseIf_();
    }
  },

  /** Give the block an `else`, or take the one it has away. */
  updateElse_(this: ControlsIfBlock, wanted: boolean): void {
    if (wanted && !this.hasElse_) {
      this.addElse_();
    } else if (!wanted && this.hasElse_) {
      this.removeElse_();
    }
  },

  addElse_(this: ControlsIfBlock): void {
    this.appendStatementInput('ELSE')
      .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE'])
      .appendField(
        minusField('Remove this else', block =>
          (block as ControlsIfBlock).minus(),
        ),
        'MINUS_ELSE',
      );
    this.hasElse_ = true;
  },

  /**
   * Add an `else if` and its `do`, above the `else` if there is one.
   *
   * The counter goes up FIRST, because the sockets are named after it and are
   * 1-based; it comes down last in `removeElseIf_` for the same reason. The
   * `−` closes over the number it was made with, and stays correct as branches
   * come and go because removal renumbers by shifting the CONTENTS up and
   * dropping the bottom row, never by renaming a socket.
   */
  addElseIf_(this: ControlsIfBlock): void {
    this.elseIfCount_++;
    const index = this.elseIfCount_;
    this.appendValueInput(`IF${index}`)
      .setCheck('Boolean')
      .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'])
      .appendField(
        minusField('Remove this else if', block =>
          (block as ControlsIfBlock).minus(index),
        ),
        `MINUS${index}`,
      );
    this.appendStatementInput(`DO${index}`).appendField(
      Blockly.Msg['CONTROLS_IF_MSG_THEN'],
    );
    if (this.getInput('ELSE')) {
      this.moveInputBefore('ELSE', null);
    }
  },

  removeElse_(this: ControlsIfBlock): void {
    this.removeInput('ELSE');
    this.hasElse_ = false;
  },

  /**
   * Remove one `else if`, keeping the numbering gapless.
   *
   * A socket cannot be renamed, so removing the middle of three branches is
   * done by moving the CONTENTS of every branch below it up one and then
   * dropping the last row. What the learner sees is the row they pointed at
   * disappearing; what the block ends up with is `IF1`…`IF{n-1}` with nothing
   * missing, which is what the generator and the saved state both assume.
   *
   * The blocks in the row being removed are disconnected rather than deleted —
   * a condition somebody built is not something to throw away because a branch
   * was — and `bumpNeighbours` is what moves them clear of the block instead of
   * leaving them stacked underneath it.
   */
  removeElseIf_(this: ControlsIfBlock, index?: number): void {
    if (index !== undefined && index !== this.elseIfCount_) {
      // Two inputs per branch, and `IF0`/`DO0` are the `if` itself: branch n
      // starts at inputList[2n].
      const first = index * 2;
      for (const input of [this.inputList[first], this.inputList[first + 1]]) {
        // Asking an empty socket to let go throws ("Source connection not
        // connected"), and an empty socket is the ordinary case.
        if (input?.connection?.isConnected()) {
          input.connection.disconnect();
        }
      }
      this.bumpNeighbours();
      for (let i = first + 2; i < this.inputList.length; i++) {
        const input = this.inputList[i];
        if (input.name === 'ELSE') {
          break; // Last, by construction.
        }
        const target = input.connection?.targetConnection;
        if (target) {
          this.inputList[i - 2].connection?.connect(target);
        }
      }
    }
    this.removeInput(`IF${this.elseIfCount_}`);
    this.removeInput(`DO${this.elseIfCount_}`);
    this.elseIfCount_--;
  },
} satisfies ControlsIfMutator & {elseIfCount_: number; hasElse_: boolean};

/**
 * The `+`, on the `if` row itself.
 *
 * At the very front, before the word `if`, which is where the legacy labs put
 * it and where it stays put: everything it adds appears BELOW, so a button that
 * moved with the branches would be a moving target.
 */
function controlsIfHelper(this: ControlsIfBlock): void {
  this.getInput('IF0')?.insertFieldAt(
    0,
    plusField('Add another branch', block => (block as ControlsIfBlock).plus()),
    'PLUS',
  );
}

let installed = false;

/**
 * Swap Blockly's `if` mutator for this one, once.
 *
 * Called from `buildDomainPalette`, beside `installColorBlocks`, and for the
 * same reason: it is the moment before anything reads the registry, and every
 * path that reaches a workspace — the editor, the headless generator, the AI
 * tutor's block catalogue — builds a palette first. Registration order against
 * the block DEFINITION does not matter; an extension is applied per block
 * instance, so a definition registered long ago picks this up on its next
 * `new Block`.
 */
export function installIfPlusMinus(): void {
  if (installed) {
    return;
  }
  installed = true;
  if (Blockly.Extensions.isRegistered(CONTROLS_IF_MUTATOR)) {
    Blockly.Extensions.unregister(CONTROLS_IF_MUTATOR);
  }
  Blockly.Extensions.registerMutator(
    CONTROLS_IF_MUTATOR,
    controlsIfMutator,
    controlsIfHelper as () => void,
  );
}
