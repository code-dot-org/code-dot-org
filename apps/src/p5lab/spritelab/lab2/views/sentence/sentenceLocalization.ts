// The sentence as the student reads it, in their language. A sentence is
// translated as one string per form it can take, with a {{slot}} placeholder
// for each word, so a translation can put the words in its own order; each
// word is translated on its own. The prompt sent to the model is never
// translated: it is built by promptText, in English.

import localization from '@cdo/apps/localization';
import {ImageGenerationMetadata} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';

import {
  Choices,
  phraseFilled,
  promptText,
  promptTextFromImage,
  restoreChoices,
  Segment,
  Sentence,
  sentenceFor,
  Slot,
  Word,
  wordFor,
} from './sentences';

const SENTENCE_LABELS = ['spritelab-sentence'];
const WORD_LABELS = ['spritelab-sentence', 'spritelab-word'];

const PLACEHOLDER = /\{\{(\w+)\}\}/g;
// A word is sent as "[Noun] cat", so one spelling used as two parts of
// speech gets two entries.
const CONTEXT_PREFIX = /^\[[^\]]*\]\s*/;

/** A run of fixed text, or the place a slot's word goes. */
export type SentencePiece = {text: string} | {slot: string};

export function isEnglish(locale: string = localization.locale): boolean {
  return locale.split(/[-_]/)[0] === 'en';
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

/** Translates a template, keeping its {{name}} placeholders as variables. */
function translate(template: string, labels: string[]): string {
  const names = Array.from(template.matchAll(PLACEHOLDER), m => m[1]);
  if (!names.length) {
    return localization.translate(template, labels);
  }
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

/**
 * The template for the segments as shown: a slot is a {{slot}} placeholder
 * when `shown` says so, and a phrase is kept when `keepPhrase` says so.
 * Spacing is tidied as promptText tidies it, and a full stop ends it.
 */
export function sentenceTemplate(
  segments: Segment[],
  shown: (slotId: string) => boolean,
  keepPhrase: (phrase: Segment[]) => boolean
): string {
  const parts: string[] = [];
  const add = (list: Segment[]) =>
    list.forEach(segment => {
      if ('text' in segment) {
        parts.push(segment.text);
      } else if ('slot' in segment) {
        if (shown(segment.slot)) {
          parts.push(`{{${segment.slot}}}`);
        }
      } else if (keepPhrase(segment.phrase)) {
        add(segment.phrase);
      }
    });
  add(segments);
  const text = parts
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim();
  return `${text}.`;
}

/**
 * Splits a translated template into text and slots. A slot the translation
 * repeats is placed once; one it dropped is appended, so no word is lost.
 */
export function splitTemplate(
  translated: string,
  slotIds: string[]
): SentencePiece[] {
  const pieces: SentencePiece[] = [];
  const placed = new Set<string>();
  let cursor = 0;
  for (const match of translated.matchAll(PLACEHOLDER)) {
    const index = match.index ?? 0;
    const before = translated.slice(cursor, index);
    cursor = index + match[0].length;
    const slotId = match[1];
    const known = slotIds.includes(slotId);
    if (before) {
      pieces.push({text: before});
    }
    if (known && !placed.has(slotId)) {
      pieces.push({slot: slotId});
      placed.add(slotId);
    } else if (!known) {
      // A placeholder the template never had stays visible as text.
      pieces.push({text: match[0]});
    }
  }
  const tail = translated.slice(cursor);
  if (tail) {
    pieces.push({text: tail});
  }
  slotIds
    .filter(id => !placed.has(id))
    .forEach(id => pieces.push({text: ' '}, {slot: id}));
  return pieces;
}

/** The template's pieces in the current language. */
export function translateSentence(template: string): SentencePiece[] {
  const slotIds = Array.from(template.matchAll(PLACEHOLDER), m => m[1]);
  const translated = isEnglish()
    ? template
    : translate(template, SENTENCE_LABELS);
  return splitTemplate(translated, slotIds);
}

/** A word in the current language, translated with its slot's heading. */
export function translateWord(
  word: Word,
  slot?: Pick<Slot, 'heading' | 'label'>
): string {
  if (isEnglish()) {
    return word.text;
  }
  const context = slot?.heading ?? slot?.label;
  if (!context) {
    return translate(word.text, WORD_LABELS);
  }
  const translated = translate(`[${context}] ${word.text}`, WORD_LABELS);
  return translated.replace(CONTEXT_PREFIX, '');
}

/** Interface text with {{name}} placeholders, translated and filled. */
export function translateText(
  template: string,
  values: {[name: string]: string} = {}
): string {
  const translated = isEnglish()
    ? template
    : translate(template, SENTENCE_LABELS);
  return translated.replace(
    PLACEHOLDER,
    (match, name) => values[name] ?? match
  );
}

/** The template for a sentence read back: chosen words and filled phrases. */
export function readOnlyTemplate(sentence: Sentence, choices: Choices): string {
  return sentenceTemplate(
    sentence.segments,
    slotId => !!wordFor(sentence, slotId, choices[slotId]),
    phrase => phraseFilled(sentence, phrase, choices)
  );
}

/** The chosen sentence as plain text in the current language. */
export function sentenceDisplayText(
  sentence: Sentence,
  choices: Choices
): string {
  if (isEnglish()) {
    return promptText(sentence, choices);
  }
  return translateSentence(readOnlyTemplate(sentence, choices))
    .map(piece => {
      if ('text' in piece) {
        return piece.text;
      }
      const word = wordFor(sentence, piece.slot, choices[piece.slot]);
      return word ? translateWord(word, sentence.slots[piece.slot]) : '';
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * What an image was made from, in the current language. A typed prompt, or
 * choices that no longer rebuild it, is shown as promptTextFromImage gives it.
 */
export function displayTextFromImage(
  generation: ImageGenerationMetadata
): string {
  const english = promptTextFromImage(generation);
  const {sentenceId, choices, imageType, subject} = generation;
  if (isEnglish() || !choices) {
    return english;
  }
  const sentence = sentenceFor(imageType, subject, sentenceId);
  const restored = restoreChoices(sentence, {sentenceId, choices});
  if (promptText(sentence, restored) !== english) {
    return english;
  }
  return sentenceDisplayText(sentence, restored);
}
