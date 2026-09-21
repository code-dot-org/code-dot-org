/**
 * Turns a costume's feature values into an image prompt.
 *
 * The template names features the way the student sees them —
 * "A houseplant with {Leaf spots} spots" — while the values are stored
 * under the stripped key, so the fill walks the model card to get from one
 * to the other. Same shape as the adlib templates the image form already
 * fills from a choices map.
 *
 * A placeholder that cannot be filled is left in the text and reported,
 * because sending "{Leaf spots}" to the model would produce a picture that
 * quietly disagrees with the data.
 */

import {ModelCard} from './modelCard';
import {resolveTrait, TraitSource} from './traitStore';

const PLACEHOLDER = /\{([^{}]*)\}/g;

export interface PromptFill {
  prompt: string;
  /** Features the template asks for that this costume has not set. */
  missing: string[];
  /** Placeholders that name nothing in the imported model. */
  unknown: string[];
}

const unique = (values: string[]) => Array.from(new Set(values));

export function fillTraitPrompt(
  template: string,
  card: ModelCard | undefined,
  source: TraitSource
): PromptFill {
  const byName = new Map(
    (card?.fields || []).map(field => [field.id.toLowerCase(), field])
  );
  const missing: string[] = [];
  const unknown: string[] = [];

  const prompt = template.replace(PLACEHOLDER, (_match, raw: string) => {
    const name = raw.trim();
    const field = byName.get(name.toLowerCase());
    if (!field) {
      unknown.push(name);
      return `{${name}}`;
    }
    const value = resolveTrait(source, field.key);
    if (value === undefined) {
      missing.push(field.id);
      return `{${field.id}}`;
    }
    return String(value);
  });

  return {
    prompt: prompt.trim(),
    missing: unique(missing),
    unknown: unique(unknown),
  };
}

/** What a student can write in the template, for the hint under the field. */
export function availablePlaceholders(card: ModelCard | undefined): string[] {
  return (card?.fields || []).map(field => `{${field.id}}`);
}

/** A prompt is only worth sending when it is whole and says something. */
export function promptIsUsable(fill: PromptFill): boolean {
  return fill.prompt.length > 0 && !fill.missing.length && !fill.unknown.length;
}
