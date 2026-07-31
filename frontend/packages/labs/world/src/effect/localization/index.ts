/**
 * Localization for the effect editor.
 *
 * The whole editor calls `translate` from here rather than the mainline
 * singleton directly, because a translated template still has to have its
 * `{name}` placeholders filled in — and doing that *after* translation is what
 * keeps learner-entered text (parameter names, function names) out of
 * translation entirely.
 *
 * Two rules the call sites follow:
 * - Translate at *render or throw time*, never at module load. The localization
 *   engine loads lazily; a string translated at import would be English forever.
 * - Never translate user-entered text. It interpolates in as `{vars}` untouched.
 *
 * The editor container also carries `data-notranslate="true"`, which stops the
 * LocalizeJS DOM engine re-translating output already translated here.
 */

import {localization} from '@code-dot-org/core/plugins/localization';

export {localization};

/**
 * Translate an English template, then substitute `{name}` placeholders.
 *
 * The template goes through translation whole — `"{name}" needs a texture` is
 * one stable string for translators — and the values are spliced in afterwards.
 */
export function translate(
  text: string,
  vars?: Readonly<Record<string, string | number>>,
): string {
  let result = localization.translate(text);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      result = result.split(`{${name}}`).join(String(value));
    }
  }
  return result;
}
