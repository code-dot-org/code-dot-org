/**
 * Binds an adlib's blanks to a costume's feature values.
 *
 * A feature-bound blank names a model feature, and its option ids are that
 * feature's values, so the stored value selects the option and the option's
 * `text` — a phrase an image model can draw — is what reaches the prompt.
 * The student never writes the sentence and has no name to spell.
 */

import {
  AdlibChoices,
  AdlibType,
} from '@cdo/apps/lab2/views/components/guide/Adlib';

import {ModelCard} from './modelCard';
import {resolveTrait, TraitSource} from './traitStore';

/** Blanks this adlib fills from data rather than from the student. */
export function featureKeys(adlib: AdlibType | undefined): string[] {
  return (adlib?.features || []).filter(key => !!adlib?.options[key]);
}

export interface AdlibFill {
  choices: AdlibChoices;
  /** Features the sentence asks for that this costume has not set. */
  missing: string[];
}

export function choicesFromTraits(
  adlib: AdlibType | undefined,
  card: ModelCard | undefined,
  source: TraitSource
): AdlibFill {
  const choices: AdlibChoices = {};
  const missing: string[] = [];
  for (const key of featureKeys(adlib)) {
    const field = card?.fields.find(
      f => f.id.toLowerCase() === key.toLowerCase()
    );
    if (!field) {
      continue;
    }
    const value = resolveTrait(source, field.key);
    if (value === undefined) {
      missing.push(field.id);
      continue;
    }
    choices[key] = String(value);
  }
  return {choices, missing};
}

/**
 * The same fill the Adlib component renders, for the redraw path where no
 * component is mounted. A blank with no choice is left in the text so a
 * caller can see the sentence is not whole.
 */
export function fillAdlib(
  adlib: AdlibType | undefined,
  choices: AdlibChoices
): string {
  if (!adlib) {
    return '';
  }
  let output = adlib.template;
  for (const [key, options] of Object.entries(adlib.options)) {
    const text = options.find(option => option.id === choices[key])?.text;
    if (text) {
      output = output.replace(`{${key}}`, text);
    }
  }
  return output.trim();
}

/** A sentence still holding a blank must not be sent. */
export function adlibIsFilled(
  adlib: AdlibType | undefined,
  prompt: string
): boolean {
  return !!adlib && prompt.length > 0 && !/\{[^{}]*\}/.test(prompt);
}

/**
 * Value ids a feature-bound blank offers that the model does not have, and
 * the reverse. An author sees this rather than a picture that disagrees
 * with the data.
 */
export function mismatchedValues(
  adlib: AdlibType | undefined,
  card: ModelCard | undefined
): {key: string; unknown: string[]; uncovered: string[]}[] {
  const out: {key: string; unknown: string[]; uncovered: string[]}[] = [];
  for (const key of featureKeys(adlib)) {
    const field = card?.fields.find(
      f => f.id.toLowerCase() === key.toLowerCase()
    );
    if (!field?.values) {
      continue;
    }
    const ids = (adlib?.options[key] || []).map(o => o.id);
    const unknown = ids.filter(id => !field.values?.includes(id));
    const uncovered = field.values.filter(v => !ids.includes(v));
    if (unknown.length || uncovered.length) {
      out.push({key: field.id, unknown, uncovered});
    }
  }
  return out;
}
