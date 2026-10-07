// Whose event a handler is (specs/EVENTS.md, "Whose event").
//
// An actor's event block says whose event it hears in words, not in a
// socket. In an actor file, and in the code one placed actor carries on a
// map, it is always the actor the code is about: `when this actor starts
// falling`. In a world file it is every actor of a kind: `when any ⟨Coin▾⟩
// is clicked`, registered on the kind so that it reaches the coins placed
// later too.
//
// THE SOCKET THIS REPLACES took any actor value, and in every project the
// lab has it held exactly one of those two, by file. What else it would take
// meant nothing useful — an actor in a variable, read once when the world is
// built — and one thing broken: `this actor` in a world, which names an actor
// nobody declared there and stopped the project as it loaded.
//
// ONE STORED FIELD, `SUBJECT`: empty means this actor, and a kind's module
// path means any actor of that kind. The field decides what the block says,
// so what it says follows from what is stored rather than from guessing the
// file while a block loads — the file a block is in is not known until the
// rest of the file has loaded around it. Which kind of file it is still
// decides two things: what a NEW block starts as, and whether what is stored
// belongs there (`misplacedBlocks`).

import type {Block, BlockSvg, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {localization} from '@code-dot-org/core/plugins/localization';

import {
  actorFieldOptions,
  bindLiveOptions,
  type DropdownOptions,
} from './moduleOptions';
import {definesWorld, workspaceOfBlock} from './workspaceRoots';

/** The stored field: empty for this actor, a kind's module path otherwise. */
export const SUBJECT_FIELD = 'SUBJECT';
/** The words shown for this actor, and the input that holds them. */
export const THIS_FIELD = 'SUBJECT_THIS';
export const THIS_INPUT = 'SUBJECT_THIS_INPUT';
/** The word in front of a kind, and the input holding it and the kind. */
export const ANY_FIELD = 'SUBJECT_ANY';
export const ANY_INPUT = 'SUBJECT_ANY_INPUT';

export const EVENT_SUBJECT_EXTENSION = 'world_event_subject';

const translate = (text: string): string => localization.translate(text);

/** The kind a handler is about, or undefined for this actor. */
export const subjectKindOf = (block: Block): string | undefined =>
  (block.getFieldValue(SUBJECT_FIELD) as string | null) || undefined;

/** Whether the block sits in a world file, asking through a flyout. */
const inWorld = (block: Block): boolean =>
  definesWorld(workspaceOfBlock(block));

/**
 * What the dropdown offers: the project's kinds, after an entry for the
 * empty value — `this actor` where that is the answer, and a prompt to pick
 * one in a world, where it is not. The empty value is always listed, so the
 * dropdown can name it, and so a handler pasted from one kind of file into
 * the other can be set right from the menu.
 */
const subjectOptions = (field?: FieldDropdown): DropdownOptions => {
  const block = field?.getSourceBlock();
  const empty = block && inWorld(block) ? '(pick a kind)' : 'this actor';
  return [
    [translate(empty), ''],
    // `actorFieldOptions` says "(no actors yet)" with the empty value when
    // there are none, which here is the row above.
    ...actorFieldOptions().filter(([, value]) => value !== ''),
  ];
};

const setVisible = (block: Block, input: string, visible: boolean) => {
  const held = block.getInput(input);
  if (held && held.isVisible() !== visible) {
    held.setVisible(visible);
  }
};

/**
 * Show the words that say what is stored: `this actor`, or `any` and the
 * kind. The kind also shows for an empty value in a world, where the empty
 * value is a mistake and the dropdown is how it is put right.
 *
 * WHOLE INPUTS, not fields: Blockly lays out a hidden field's spacing as
 * though it were there, which left a gap the width of two spaces where the
 * other words had been.
 */
export function syncSubject(block: Block): void {
  if (!block.getField(SUBJECT_FIELD)) {
    return;
  }
  const kind = subjectKindOf(block);
  const picking = !kind && inWorld(block);
  setVisible(block, THIS_INPUT, !kind && !picking);
  setVisible(block, ANY_INPUT, Boolean(kind) || picking);
  (block as BlockSvg).queueRender?.();
}

/**
 * On every actor event block: the live list of kinds, the words in the
 * reader's language, and the starting subject for where it is made — a kind
 * in a world, this actor anywhere else. Loading a block sets its fields AFTER
 * this runs, so a stored subject replaces the starting one.
 */
export const eventSubjectExtension: Extension = defineExtension(
  EVENT_SUBJECT_EXTENSION,
  {
    extension() {
      const subject = this.getField(SUBJECT_FIELD) as FieldDropdown | null;
      if (!subject) {
        return;
      }
      bindLiveOptions(subject, subjectOptions);
      this.getField(THIS_FIELD)?.setValue(translate('this actor'));
      this.getField(ANY_FIELD)?.setValue(translate('any'));
      const kinds = actorFieldOptions().filter(([, value]) => value !== '');
      subject.setValue(inWorld(this) ? (kinds[0]?.[1] ?? '') : '');
      // Whatever sets the value — the menu, a load, an undo — the words
      // follow it.
      const field = subject as unknown as {
        doValueUpdate_: (value: string) => void;
      };
      const update = field.doValueUpdate_.bind(subject);
      field.doValueUpdate_ = (value: string) => {
        update(value);
        syncSubject(this);
      };
      syncSubject(this);
    },
  },
);
