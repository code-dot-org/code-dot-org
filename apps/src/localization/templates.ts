// Phrases with {{name}} placeholders that a translation may reorder. They
// are sent to LocalizeJS as markup in which each placeholder is a <var>
// element; LocalizeJS keeps a <var> out of the translated text and returns
// it wherever the translator put it.

import localization from './Localization';

/** Matches a {{name}} placeholder; the name is the first group. */
export const PLACEHOLDER = /\{\{(\w+)\}\}/g;

export function isEnglishLocale(locale: string = localization.locale): boolean {
  return locale.split(/[-_]/)[0] === 'en';
}

export function placeholderNames(template: string): string[] {
  return Array.from(template.matchAll(PLACEHOLDER), m => m[1]);
}

/**
 * The template as a phrase LocalizeJS can reorder: each {{name}} becomes
 * <var name>name</var>. LocalizeJS names a variable after the element's
 * first attribute and never sends its content to translators.
 */
export function templateToElement(template: string): HTMLElement {
  const phrase = document.createElement('span');
  let cursor = 0;
  for (const match of template.matchAll(PLACEHOLDER)) {
    const index = match.index ?? 0;
    phrase.append(template.slice(cursor, index));
    const variable = document.createElement('var');
    variable.setAttribute(match[1], '');
    variable.textContent = match[1];
    phrase.append(variable);
    cursor = index + match[0].length;
  }
  phrase.append(template.slice(cursor));
  return phrase;
}

/**
 * A translated phrase back as a template: text as it is, and each <var> as
 * {{name}}. LocalizeJS lowercases variable names, so a name is matched to
 * the template's own spelling.
 */
export function elementToTemplate(phrase: Node, names: string[]): string {
  const spelling = new Map(names.map(name => [name.toLowerCase(), name]));
  return Array.from(phrase.childNodes)
    .map(node => {
      if (node instanceof HTMLElement && node.tagName === 'VAR') {
        const name = node.attributes[0]?.name ?? node.textContent?.trim() ?? '';
        return `{{${spelling.get(name.toLowerCase()) ?? name}}}`;
      }
      return node.textContent ?? '';
    })
    .join('');
}

/**
 * Translates a template, keeping its {{name}} placeholders as variables.
 * The result is a template in the current language with the same names.
 */
export function translateTemplate(template: string, labels: string[]): string {
  const names = placeholderNames(template);
  if (!names.length) {
    return localization.translate(template, labels);
  }
  // LocalizeJS may return the phrase as a new element, as the element it was
  // given translated in place, or as an HTML string.
  const translated: unknown = localization.translate(
    templateToElement(template),
    labels
  );
  if (typeof translated === 'string') {
    const parsed = document.createElement('span');
    parsed.innerHTML = translated;
    return elementToTemplate(parsed, names);
  }
  return elementToTemplate(translated as Node, names);
}

/** A template translated, then its placeholders filled from `values`. */
export function translateFilled(
  template: string,
  values: {[name: string]: string} = {},
  labels: string[] = []
): string {
  const translated = isEnglishLocale()
    ? template
    : translateTemplate(template, labels);
  return translated.replace(
    PLACEHOLDER,
    (match, name) => values[name] ?? match
  );
}
