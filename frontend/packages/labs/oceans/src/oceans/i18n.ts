import MessageFormat from 'messageformat';

import {localization} from '@code-dot-org/core/plugins/localization';

import data from '../../i18n/oceans.json';

type CompiledMessages = Record<
  string,
  (options?: Record<string, unknown>) => string
>;

/** The TMS label attached to every oceans string. */
export const TRANSLATION_LABEL = 'oceans';

let messages: CompiledMessages | undefined;
let overrides: CompiledMessages = {};

/**
 * Translates a formatted English message through LocalizeJS.
 *
 * "Not {word}" is special-cased as it is in apps/src/fish/Fish.js: the word
 * arrives already translated, so the TMS phrase is the unique
 * "Not oceans-word:X" rather than a fresh "Not X" for every word and locale.
 */
const translate = (key: string, options?: Record<string, unknown>): string => {
  if (key === 'notWord') {
    return localization
      .translate(`Not oceans-word:${options?.word}`, [TRANSLATION_LABEL])
      .replace('oceans-word:', '');
  }
  return localization.translate(messages![key](options), [TRANSLATION_LABEL]);
};

/**
 * Initialises the i18n runtime with optional caller-supplied message overrides.
 *
 * Must be called before `t`. Subsequent calls reset the message registry.
 * Overrides are returned verbatim; a host that passes them has translated
 * them already.
 *
 * @param i18n - Optional compiled message overrides keyed by message id.
 */
const initI18n = (i18n: CompiledMessages = {}): void => {
  // English pluralisation rules are used for all locales for now.
  const mf = new MessageFormat('en');
  messages = mf.compile(data) as unknown as CompiledMessages;
  overrides = i18n;
};

/**
 * Looks up a localised string by key.
 *
 * @param key - Message id as defined in `i18n/oceans.json`.
 * @param options - Interpolation variables for the message.
 * @returns The formatted localised string.
 * @throws If `initI18n` has not been called yet.
 */
const t = (key: string, options?: Record<string, unknown>): string => {
  if (!messages) {
    throw new Error('I18n must be initialized before calling t');
  }
  if (overrides[key]) {
    return overrides[key](options);
  }
  return translate(key, options);
};

export default {
  initI18n,
  t,
};
