/**
 * The feature-name dropdown for the set-trait block.
 *
 * The options are the imported model's features, so a student cannot name a
 * feature the model does not have. This is the one guard that makes a wrong
 * trait name impossible instead of silent: a typed name reaches predict as a
 * key nothing reads, and the prediction comes back confident and wrong.
 *
 * Built on the externalSceneDropdown pattern, which also serves options out
 * of redux.
 */

import * as BlocklyCore from 'blockly/core';

import {getStore} from '@cdo/apps/redux';

import {ModelCard} from '../ai/traits/modelCard';

export const FIELD_TRAIT_NAME_TYPE = 'field_spritelab2_trait_name';

const NO_MODEL: [string, string][] = [['no model imported', '']];

function importedCard(): ModelCard | undefined {
  return getStore().getState().spriteLab2?.modelCard;
}

/**
 * The options, plus the field's own value when they lack it. A saved block
 * loads before the model list arrives; without this, Blockly would reject
 * the saved value and the block would lose it on the next save.
 */
export function withCurrentValue(
  options: [string, string][],
  value: string | null | undefined
): [string, string][] {
  if (!value || options.some(([, v]) => v === value)) {
    return options;
  }
  const known = options.filter(([, v]) => v !== '');
  return [...known, [value, value]];
}

// Any string is kept (see withCurrentValue); the options catch up once the
// model loads.
class PersistentDropdown extends BlocklyCore.FieldDropdown {
  protected doClassValidation_(newValue?: string): string | null {
    return typeof newValue === 'string' ? newValue : null;
  }
}

// Label is the feature id the student recognises; value is the stripped key
// that testData needs, so the generator never has to strip it again.
function traitMenuOptions(this: BlocklyCore.FieldDropdown): [string, string][] {
  const card = importedCard();
  const options: [string, string][] =
    card && card.fields.length
      ? card.fields.map(field => [field.id, field.key])
      : NO_MODEL;
  return withCurrentValue(options, this.getValue());
}

export class TraitNameField extends PersistentDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new TraitNameField(traitMenuOptions);
  }
}

export const FIELD_TRAIT_VALUE_TYPE = 'field_spritelab2_trait_value';

/**
 * Values for whichever feature the block's trait-name field holds. A
 * continuous feature has no value list, so the field falls back to free
 * entry and the block's generator keeps the number.
 */
export class TraitValueField extends PersistentDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new TraitValueField(function (this: BlocklyCore.FieldDropdown) {
      const block = this.getSourceBlock();
      const key = block?.getFieldValue('TRAIT');
      const field = importedCard()?.fields.find(f => f.key === key);
      const options: [string, string][] = field?.values?.length
        ? field.values.map(value => [value, value] as [string, string])
        : [['—', '']];
      return withCurrentValue(options, this.getValue());
    });
  }
}

/** Relabel every trait field after the model arrives. */
export function refreshTraitFields(): void {
  const workspace: BlocklyCore.WorkspaceSvg | undefined =
    Blockly.getMainWorkspace?.();
  if (!workspace) {
    return;
  }
  const flyouts = [workspace.getFlyout(), workspace.getToolbox()?.getFlyout()];
  [workspace, ...flyouts.map(flyout => flyout?.getWorkspace())].forEach(ws =>
    ws?.getAllBlocks(false).forEach(block =>
      block.inputList.forEach(input =>
        input.fieldRow.forEach(field => {
          if (field instanceof PersistentDropdown) {
            // An empty value was the no-model placeholder; take the first
            // real option now that there is one.
            const options = field.getOptions(false);
            field.setValue(field.getValue() || options[0][1]);
            field.forceRerender();
          }
        })
      )
    )
  );
}

export function registerTraitFields(): void {
  BlocklyCore.fieldRegistry.register(FIELD_TRAIT_NAME_TYPE, TraitNameField);
  BlocklyCore.fieldRegistry.register(FIELD_TRAIT_VALUE_TYPE, TraitValueField);
}
