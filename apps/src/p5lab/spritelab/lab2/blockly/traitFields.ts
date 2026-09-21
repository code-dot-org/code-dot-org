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

// Label is the feature id the student recognises; value is the stripped key
// that testData needs, so the generator never has to strip it again.
function traitMenuOptions(): [string, string][] {
  const card = importedCard();
  if (!card || card.fields.length === 0) {
    return NO_MODEL;
  }
  return card.fields.map(field => [field.id, field.key]);
}

export class TraitNameField extends BlocklyCore.FieldDropdown {
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
export class TraitValueField extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new TraitValueField(function (this: TraitValueField) {
      const block = this.getSourceBlock();
      const key = block?.getFieldValue('TRAIT');
      const field = importedCard()?.fields.find(f => f.key === key);
      if (!field?.values?.length) {
        return [['—', '']];
      }
      return field.values.map(value => [value, value] as [string, string]);
    });
  }
}

export function registerTraitFields(): void {
  BlocklyCore.fieldRegistry.register(FIELD_TRAIT_NAME_TYPE, TraitNameField);
  BlocklyCore.fieldRegistry.register(FIELD_TRAIT_VALUE_TYPE, TraitValueField);
}
