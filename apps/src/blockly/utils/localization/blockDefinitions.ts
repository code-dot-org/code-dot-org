import * as BlocklyCore from 'blockly/core';

import {BlockJson} from '@cdo/apps/blockly/types';
import localization from '@cdo/apps/localization';

const BLOCK_LABELS = ['blockly-block'];
const TOOLTIP_LABELS = ['blockly-block', 'blockly-tooltip'];

/**
 * Translates block text. Numbers and #rrggbb colours are returned as given.
 * Text under four characters, or any text when forcePrefix is set, is sent
 * as "[block] text" so translators see it is a block label.
 */
export function translate(
  text: string,
  labels: string[],
  forcePrefix: boolean = false
) {
  labels = Array.from(new Set(labels.concat(BLOCK_LABELS)));

  if (isFinite(+(text || NaN))) {
    return text;
  }

  if (text.match(/^#[0-9a-fA-F]{6}$/)) {
    return text;
  }

  if (text.length < 4 || forcePrefix) {
    const result = localization.translate(`[block] ${text}`, labels);
    if (result.startsWith('[block]')) {
      return result.substring(7).trim();
    }
  }

  return localization.translate(text, labels);
}

/**
 * Returns a copy of a JSON block definition with its tooltip and messages
 * translated.
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
 * Returns a definition whose init() translates the block it builds: string
 * and function tooltips, unnamed labels, and dropdown option text. Wrapping
 * an already wrapped definition replaces the earlier wrapper.
 */
export function localizeBlockInitDefinition(
  blockDefinition: BlockInitDefinition
): BlockInitDefinition {
  // Set on blockText blocks, which getBlockDefinitionsForUpdatedLocale
  // translates before their init() exists.
  if (blockDefinition.isLocalized) {
    return blockDefinition;
  }

  if (blockDefinition.oldInit) {
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
  // An object tooltip names another block, whose own init translates it.
}

/**
 * Translates an input's labels as one message, with %N standing for each
 * other field in order, then reorders the field row to match the
 * translation. An input with a connection gets a trailing %N for it, which
 * gives translators the whole sentence but cannot move: Blockly always draws
 * the connection at the end of the row. A field whose %N the translator
 * dropped is appended. Fields are kept, not recreated, so their names and
 * values survive.
 */
function localizeInputInPlace(
  block: BlocklyCore.Block,
  input: BlocklyCore.Input
): void {
  // A FieldVariable's options are the workspace's variables; setOptions on
  // one makes init() throw, and the block loads as "unknown block".
  for (const field of input.fieldRow) {
    if (
      field instanceof BlocklyCore.FieldDropdown &&
      !(field instanceof BlocklyCore.FieldVariable)
    ) {
      localizeDropdownInPlace(field);
    }
  }

  // A named label (NAME, PARAMS) holds block state, not authored text, so it
  // is a %N like any other field.
  const existingLabels: BlocklyCore.FieldLabel[] = [];
  const args: BlocklyCore.Field[] = [];
  const parts: string[] = [];
  let buf = '';
  for (const field of input.fieldRow) {
    if (field instanceof BlocklyCore.FieldLabel && !field.name) {
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

  if (existingLabels.length === 0) {
    return;
  }

  const connectionIndex = input.connection ? args.length : -1;
  if (connectionIndex >= 0) {
    parts.push(`%${connectionIndex + 1}`);
  }

  const message = parts.join(' ');
  if (!message) {
    return;
  }

  const translated = translate(message, BLOCK_LABELS);

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
      consumed.add(index);
    } else if (index >= 0 && index < args.length && !consumed.has(index)) {
      segments.push({kind: 'arg', index});
      consumed.add(index);
    }
    cursor = match.index + match[0].length;
  }
  const tail = translated.slice(cursor);
  if (tail) segments.push({kind: 'text', text: tail});

  for (let i = 0; i < args.length; i++) {
    if (!consumed.has(i)) {
      segments.push({kind: 'arg', index: i});
    }
  }

  // Reusing the original labels keeps subclass behavior such as
  // CdoFieldLabel's fixed size.
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

  // init() runs before render, so no field has DOM to tear down.
  input.fieldRow.length = 0;
  input.fieldRow.push(...rebuilt);
}

function mountLabel(
  block: BlocklyCore.Block,
  text: string
): BlocklyCore.FieldLabel {
  const field = new BlocklyCore.FieldLabel(text);
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
    return option;
  };

  // setOptions() resets the value to the first option.
  const currentValue = field.getValue();

  if (field.isOptionListDynamic()) {
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
