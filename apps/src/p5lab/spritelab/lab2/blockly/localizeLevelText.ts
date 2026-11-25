// The text a level puts in its blocks, such as what a sprite says, in the
// student's language. Only level data passes through here, never a
// student's saved project.

import {
  isEnglishLocale,
  translateFilled,
} from '@cdo/apps/localization/templates';

// The labels the legacy labs give the same strings, so a string shared with
// them shares its translation.
const STRING_LABELS = ['blockly-block', 'gamelab-string'];

// The blocks whose words are shown to the player, and the fields that hold
// them. A `text` block in one of their inputs is translated too.
const TEXT_FIELDS: {[type: string]: string[]} = {
  gamelab_spriteSay: ['SPEECH'],
  gamelab_spriteThink: ['SPEECH'],
  gamelab_spriteSayTime: [],
  gamelab_printText: [],
  gamelab_showTitleScreen: [],
  gamelab_setPrompt: [],
  spritelab2_showTitle: ['TEXT'],
};

type Json = {[key: string]: unknown};

function isObject(value: unknown): value is Json {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function translateFields(block: Json, names: string[]): Json {
  if (!isObject(block.fields)) {
    return block;
  }
  const fields = {...block.fields};
  names.forEach(name => {
    const value = fields[name];
    if (typeof value === 'string' && value.trim()) {
      fields[name] = translateFilled(value, {}, STRING_LABELS);
    }
  });
  return {...block, fields};
}

// A text block plugged into an input of a block whose words are shown.
function translateTextInputs(block: Json): Json {
  if (!isObject(block.inputs)) {
    return block;
  }
  const inputs = Object.fromEntries(
    Object.entries(block.inputs).map(([name, input]) => {
      if (!isObject(input)) {
        return [name, input];
      }
      const translated = {...input};
      (['block', 'shadow'] as const).forEach(slot => {
        const inner = input[slot];
        if (isObject(inner) && inner.type === 'text') {
          translated[slot] = translateFields(inner, ['TEXT']);
        }
      });
      return [name, translated];
    })
  );
  return {...block, inputs};
}

function localize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(localize);
  }
  if (!isObject(value)) {
    return value;
  }
  let out: Json = Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [key, localize(inner)])
  );
  const type = out.type;
  if (typeof type === 'string' && type in TEXT_FIELDS) {
    out = translateTextInputs(translateFields(out, TEXT_FIELDS[type]));
  }
  return out;
}

/**
 * A copy of level data with the shown words of its blocks in the current
 * language; in English, the data itself. Block types, ids and every other
 * field are left as they are.
 */
export function localizeLevelText<T>(data: T): T {
  if (isEnglishLocale() || data === undefined || data === null) {
    return data;
  }
  return localize(data) as T;
}
