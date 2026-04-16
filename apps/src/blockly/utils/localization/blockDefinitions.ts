import * as BlocklyCore from 'blockly/core';

import {BlockJson} from '@cdo/apps/blockly/types';
import localization from '@cdo/apps/localization';

const BLOCK_LABELS = ['blockly-block'];
const TOOLTIP_LABELS = ['blockly-block', 'blockly-tooltip'];

/**
 * Wraps localization.translate so that for short labels that are a single word,
 * we add a prefix to them so they can be translated with context.
 */
function translate(text: string, labels: string[]) {
  if (text.length < 4) {
    const result = localization.translate(`[block] ${text}`, labels);
    if (result.startsWith('[block]')) {
      return result.substring(7).trim();
    }
  }

  return localization.translate(text, labels);
}

/**
 * Localizes a modern block definition and returns the localized form of it.
 */
export function localizeBlockDefinition(blockDefinition: BlockJson): BlockJson {
  return {
    ...blockDefinition,
    tooltip:
      blockDefinition.tooltip !== undefined
        ? translate(blockDefinition.tooltip, TOOLTIP_LABELS)
        : undefined,
    message0:
      blockDefinition.message0 !== undefined
        ? translate(blockDefinition.message0, BLOCK_LABELS)
        : undefined,
    message1:
      blockDefinition.message1 !== undefined
        ? translate(blockDefinition.message1, BLOCK_LABELS)
        : undefined,
    message2:
      blockDefinition.message2 !== undefined
        ? translate(blockDefinition.message2, BLOCK_LABELS)
        : undefined,
    message3:
      blockDefinition.message3 !== undefined
        ? translate(blockDefinition.message3, BLOCK_LABELS)
        : undefined,
  };
}

type BlockInitDefinition = (typeof BlocklyCore.Blocks)[string];

/**
 * Wraps an init()-style block definition so that after the original init runs,
 * any authored display text on the constructed block is routed through the
 * localizer.
 *
 * Covers the surface that pre-json init blocks actually expose:
 *   - tooltip set via setTooltip(), either as a literal string or as a
 *     function returning a string (both forms preserved)
 *   - label fields (FieldLabel and subclasses, e.g. CdoFieldLabel), whether
 *     added via appendField('text') or via new FieldLabel(...)
 *   - dropdown option display text (FieldDropdown and subclasses). Static
 *     array generators are snapshotted and rewritten; function generators
 *     are wrapped so every invocation retranslates.
 *
 * Fields without authored text (images, numbers, text inputs, checkboxes,
 * variables) are left alone.
 */
export function localizeBlockInitDefinition(
  blockDefinition: BlockInitDefinition
): BlockInitDefinition {
  // We can ensure that this function does not happen for any blocks
  // we localize in a different way. Behaviors and other custom blocks
  // eventually get an init() function structure, but we localize with
  // the extra context beforehand.
  if (blockDefinition.isLocalized) {
    return blockDefinition;
  }

  // Detect if we have already wrapped this block
  if (blockDefinition.oldInit) {
    // Reset it
    blockDefinition.init = blockDefinition.oldInit;
  }

  const originalInit = blockDefinition.init;
  return {
    ...blockDefinition,
    oldInit: originalInit,
    init: function () {
      originalInit.call(this);
      localizeBlockInPlace(this as BlocklyCore.Block);
    },
  };
}

function localizeBlockInPlace(block: BlocklyCore.Block): void {
  localizeTooltipInPlace(block);
  for (const input of block.inputList) {
    localizeInputInPlace(block, input);
  }
}

function localizeTooltipInPlace(block: BlocklyCore.Block): void {
  const tooltip = block.tooltip;
  if (typeof tooltip === 'string') {
    if (tooltip.length > 0) {
      block.setTooltip(translate(tooltip, TOOLTIP_LABELS));
    }
  } else if (typeof tooltip === 'function') {
    block.setTooltip(() => {
      const resolved = tooltip();
      return typeof resolved === 'string'
        ? translate(resolved, TOOLTIP_LABELS)
        : resolved;
    });
  }
  // Object-form tooltips delegate to another block; that block handles its own
  // localization when its init runs.
}

/**
 * Groups an input's fieldRow into a single translatable message and reshuffles
 * the row based on where the translator places the %N placeholders.
 *
 * Label text runs between non-label fields are concatenated into text
 * fragments; every non-label field becomes a %N placeholder in authored
 * order. For value and statement inputs, the downstream connection slot is
 * exposed as a trailing %N as well, so translators see the full sentence
 * (e.g. `"do %1"` where %1 is the statement block that will connect).
 *
 * The translator receives e.g. `"repeat until %1"` and can return
 * `"%1 まで繰り返す"` — the image/dropdown at %1 then moves accordingly.
 * Connection slots are an exception: Blockly always renders a connection
 * at the end of its input, so moving its %N in translation gives the
 * translator context without actually reordering the connection.
 *
 * Runs during init, before the block is rendered, so fieldRow can be spliced
 * directly without DOM teardown. Field names on the preserved non-label
 * fields survive unchanged, so `getFieldValue('DIR')` and friends still work.
 *
 * Dropdown options are translated in a separate pass so their internal text
 * gets retargeted regardless of the surrounding sentence.
 */
function localizeInputInPlace(
  block: BlocklyCore.Block,
  input: BlocklyCore.Input
): void {
  // Translate dropdown options up-front; this is independent of grouping.
  for (const field of input.fieldRow) {
    if (field instanceof BlocklyCore.FieldDropdown) {
      localizeDropdownInPlace(field);
    }
  }

  // Bucket fields into text fragments (labels) and %N args (everything else).
  const existingLabels: BlocklyCore.FieldLabel[] = [];
  const args: BlocklyCore.Field[] = [];
  const parts: string[] = [];
  let buf = '';
  for (const field of input.fieldRow) {
    if (field instanceof BlocklyCore.FieldLabel) {
      buf += field.getText();
      existingLabels.push(field);
    } else {
      if (buf) {
        parts.push(buf);
        buf = '';
      }
      args.push(field);
      parts.push(`%${args.length}`);
    }
  }
  if (buf) {
    parts.push(buf);
  }

  // Nothing translatable in this row — pure non-label fields (e.g. a lone
  // dropdown). Dropdown options were already handled above.
  if (existingLabels.length === 0) {
    return;
  }

  // Value and statement inputs have a downstream connection slot that renders
  // after the fieldRow. Expose it as a trailing %N placeholder so translators
  // see the full sentence (e.g. `"do %2"` for a statement input labeled "do").
  // Blockly renders the connection at the row's end regardless of where the
  // translator places this %N, so on the rebuild side the connection index is
  // simply consumed without emitting a field.
  const connectionIndex = input.connection ? args.length : -1;
  if (connectionIndex >= 0) {
    parts.push(`%${connectionIndex + 1}`);
  }

  const message = parts.join(' ');
  if (!message) {
    return;
  }

  const translated = translate(message, BLOCK_LABELS);

  // Walk the translated message, emitting text fragments and %N references
  // in whatever order the translator produced.
  type Segment = {kind: 'text'; text: string} | {kind: 'arg'; index: number};
  const segments: Segment[] = [];
  const consumed = new Set<number>();
  const placeholder = /%(\d+)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = placeholder.exec(translated)) !== null) {
    const pre = translated.slice(cursor, match.index);
    if (pre) segments.push({kind: 'text', text: pre});
    const index = Number(match[1]) - 1;
    if (index === connectionIndex) {
      // Connection slot: consume it so it isn't backfilled, but don't emit
      // a fieldRow entry. Blockly will render the connection at the row end.
      consumed.add(index);
    } else if (index >= 0 && index < args.length && !consumed.has(index)) {
      segments.push({kind: 'arg', index});
      consumed.add(index);
    }
    cursor = match.index + match[0].length;
  }
  const tail = translated.slice(cursor);
  if (tail) segments.push({kind: 'text', text: tail});

  // If the translator dropped any %N, tack those fields on at the end so
  // the block never silently loses an input's dropdown or image.
  for (let i = 0; i < args.length; i++) {
    if (!consumed.has(i)) {
      segments.push({kind: 'arg', index: i});
    }
  }

  // Build the new fieldRow, reusing existing label instances where we can.
  // This preserves FieldLabel subclass behavior (e.g. CdoFieldLabel's
  // fixedSize) when the translated message has the same number of text
  // segments as the original had labels — which is the common case.
  const rebuilt: BlocklyCore.Field[] = [];
  let labelCursor = 0;
  for (const seg of segments) {
    if (seg.kind === 'text') {
      if (labelCursor < existingLabels.length) {
        const label = existingLabels[labelCursor++];
        label.setValue(seg.text);
        rebuilt.push(label);
      } else {
        rebuilt.push(mountLabel(block, seg.text));
      }
    } else {
      rebuilt.push(args[seg.index]);
    }
  }

  // Pre-render, so direct array mutation is sufficient; no DOM teardown.
  input.fieldRow.length = 0;
  input.fieldRow.push(...rebuilt);
}

function mountLabel(
  block: BlocklyCore.Block,
  text: string
): BlocklyCore.FieldLabel {
  const field = new BlocklyCore.FieldLabel(text);
  // setSourceBlock throws if already bound; this instance is freshly minted.
  field.setSourceBlock(block);
  return field;
}

function localizeDropdownInPlace(field: BlocklyCore.FieldDropdown): void {
  const translateOption = (
    option: BlocklyCore.MenuOption
  ): BlocklyCore.MenuOption => {
    if (option === 'separator') {
      return option;
    }
    const [display, value] = option;
    if (typeof display === 'string') {
      return [translate(display, BLOCK_LABELS), value];
    }
    // ImageProperties / HTMLElement options carry no translatable text.
    return option;
  };

  // setOptions() resets the selected value to the first option, so snapshot
  // the current selection and restore it once the new options are installed.
  const currentValue = field.getValue();

  if (field.isOptionListDynamic()) {
    // menuGenerator_ is protected; the cast is the documented escape hatch
    // for preserving dynamic-dropdown semantics.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = (field as any).menuGenerator_ as
      | BlocklyCore.MenuGeneratorFunction
      | undefined;
    if (original) {
      field.setOptions(function (this: BlocklyCore.FieldDropdown) {
        return original.call(this).map(translateOption);
      });
    }
  } else {
    field.setOptions(field.getOptions(false).map(translateOption));
  }

  if (currentValue !== null && currentValue !== undefined) {
    field.setValue(currentValue);
  }
}
