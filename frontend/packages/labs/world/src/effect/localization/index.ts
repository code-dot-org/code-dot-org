/**
 * Localization for the effect editor.
 *
 * FOR THE EFFECT EDITOR, AND NOTHING ELSE. It is not the lab's way of
 * translating things; it is the way ONE editor has to, and the difference is
 * the container. The graph canvas carries `data-notranslate="true"` — React
 * Flow measures and positions its own nodes, and a DOM engine rewriting their
 * text underneath it moves the wires — so the page's translation is switched
 * off in there and the editor does the job by hand instead.
 *
 * Everywhere else in the lab, English is written into the DOM as English and
 * the page translates it where it finds it. A dialog that called this would be
 * translating a string and then handing it to something that would have
 * translated it anyway. What the rest of the lab marks instead is the dynamic
 * half — a file name, a rule's name — with `data-notranslate` on the span it
 * interpolates into, because those are the project's words and not phrases.
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
