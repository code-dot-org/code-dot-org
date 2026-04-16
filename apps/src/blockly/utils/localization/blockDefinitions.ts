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
    for (const field of input.fieldRow) {
      localizeFieldInPlace(field);
    }
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

function localizeFieldInPlace(field: BlocklyCore.Field): void {
  if (field instanceof BlocklyCore.FieldLabel) {
    const text = field.getText();
    if (text) {
      field.setValue(translate(text, BLOCK_LABELS));
    }
    return;
  }
  if (field instanceof BlocklyCore.FieldDropdown) {
    localizeDropdownInPlace(field);
    return;
  }
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
