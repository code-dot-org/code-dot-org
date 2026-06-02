import MessageFormat from 'messageformat';

import data from '../../i18n/oceans.json';

type CompiledMessages = Record<
  string,
  (options?: Record<string, unknown>) => string
>;

let messages: CompiledMessages | undefined;

/**
 * Initialises the i18n runtime with optional consumer-supplied raw strings and locale.
 *
 * The English base catalog is compiled first with `locale`'s plural rules.
 * `rawStrings` overrides per-key with the same locale's rules; omitted keys
 * fall back to English. `preCompiled` layered last for backward-compat callers
 * that supply already-compiled functions.
 *
 * Must be called before `t`. Subsequent calls reset the message registry.
 */
const initI18n = (
  rawStrings: Record<string, string> = {},
  locale = 'en',
  preCompiled: CompiledMessages = {},
): void => {
  const mf = new MessageFormat(locale);
  const baseEn = mf.compile(data) as unknown as CompiledMessages;
  const localized =
    Object.keys(rawStrings).length > 0
      ? (mf.compile(rawStrings) as unknown as CompiledMessages)
      : {};
  messages = {...baseEn, ...localized, ...preCompiled};
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
  return messages[key](options);
};

export default {
  initI18n,
  t,
};
