// The list of a workspace's sections, for jumping to one
// (specs/LAZY_WORKSPACE_PLAN.md, "Jumping to a section").
//
// A section is named by how its header reads: `when this actor starts
// falling`, `define world named Platform World with 11 rules`. Read off the
// built block, since what a header says is its fields and what sits in its
// sockets — a dropdown's shown text, not its stored value — and only the
// renderer's own field objects know that.

import {Blockly} from '@code-dot-org/blockly';

/** One entry in the list. */
export interface SectionEntry {
  id: string;
  label: string;
}

/** The show/hide chevron (`bodyToggle`), which is not part of what it says. */
const TOGGLE_FIELD = 'BODY_TOGGLE';

/** How long a label may be before it is cut, in characters. */
export const LABEL_LENGTH = 60;

/** What a block's header says: its fields and its sockets, not its mouths. */
export function headerText(block: Blockly.Block): string {
  const words: string[] = [];
  for (const input of block.inputList) {
    if (!input.isVisible()) {
      continue;
    }
    if (input.type === Blockly.inputs.inputTypes.STATEMENT) {
      continue;
    }
    for (const field of input.fieldRow) {
      if (field.name === TOGGLE_FIELD || !field.isVisible()) {
        continue;
      }
      const text = field.getText();
      if (text.trim()) {
        words.push(text);
      }
    }
    const held = input.connection?.targetBlock();
    if (held && input.type === Blockly.inputs.inputTypes.VALUE) {
      words.push(headerText(held));
    }
  }
  return words.join(' ').replace(/\s+/g, ' ').trim();
}

/** A label, cut to `LABEL_LENGTH` with an ellipsis. */
export function labelOf(block: Blockly.Block): string {
  const text = headerText(block) || block.type;
  return text.length > LABEL_LENGTH
    ? `${text.slice(0, LABEL_LENGTH - 1).trimEnd()}…`
    : text;
}

/** Every section, top to bottom: the order the column shows them in. */
export function sectionsOf(
  workspace: Blockly.Workspace,
  placeOf: (block: Blockly.Block) => number,
): SectionEntry[] {
  return workspace
    .getTopBlocks(false)
    .filter(block => !block.isInsertionMarker() && !block.isShadow())
    .sort((a, b) => placeOf(a) - placeOf(b))
    .map(block => ({id: block.id, label: labelOf(block)}));
}
