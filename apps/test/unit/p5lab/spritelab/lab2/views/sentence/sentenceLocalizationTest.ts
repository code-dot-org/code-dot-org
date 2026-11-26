import localization from '@cdo/apps/localization';
import {
  elementToTemplate,
  templateToElement,
} from '@cdo/apps/localization/templates';
import {
  displayTextFromImage,
  readOnlyTemplate,
  sentenceDisplayText,
  sentenceTemplate,
  splitTemplate,
  translateSentence,
  translateText,
  translateWord,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentenceLocalization';
import {
  phraseFilled,
  promptText,
  sentenceFor,
  withLead,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentences';

const SPANISH: {[source: string]: string} = {
  'A {{creature}}.': 'Un {{creature}}.',
  'A {{adjective}} {{creature}}.': 'Un {{creature}} {{adjective}}.',
  'A {{adjective}} {{creature}} wearing a {{clothing}}.':
    'Un {{creature}} {{adjective}} con {{clothing}}.',
  '[Noun] cat': '[Noun] gato',
  '[Adjective] spooky': 'espeluznante',
  'Remove {{word}}': 'Quitar {{word}}',
};

const CHARACTER = sentenceFor('sprite');
const cat = CHARACTER.slots.creature.words.find(w => w.id === 'cat');
const spooky = CHARACTER.slots.adjective.words.find(w => w.id === 'spooky');
const clothing = CHARACTER.slots.clothing.words[0];

// Stands in for LocalizeJS: a phrase element's source names each <var> by
// its first attribute, and the translation returns a new element with the
// <var>s where the translator put them, their names uppercased.
function fakeLocalize(input: unknown): unknown {
  if (typeof input === 'string') {
    return SPANISH[input] ?? input;
  }
  const source = Array.from((input as HTMLElement).childNodes)
    .map(node =>
      node instanceof HTMLElement
        ? `{{${node.attributes[0].name}}}`
        : node.textContent
    )
    .join('');
  const target = SPANISH[source];
  if (!target) {
    return input;
  }
  const out = document.createElement('span');
  out.innerHTML = target.replace(
    /\{\{(\w+)\}\}/g,
    (_m, name) => `<var ${name.toUpperCase()}>${name}</var>`
  );
  return out;
}

let locale = 'es-MX';
let translate: jest.SpyInstance;

beforeEach(() => {
  locale = 'es-MX';
  jest.spyOn(localization, 'locale', 'get').mockImplementation(() => locale);
  translate = jest
    .spyOn(localization, 'translate')
    .mockImplementation(fakeLocalize as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('sentenceTemplate', () => {
  const formFor = (shown: string[], phrase = false) =>
    sentenceTemplate(
      CHARACTER.segments,
      id => shown.includes(id),
      () => phrase
    );

  it('has one form per state the sentence can show', () => {
    expect(formFor(['creature'])).toBe('A {{creature}}.');
    expect(formFor(['adjective', 'creature'])).toBe(
      'A {{adjective}} {{creature}}.'
    );
    expect(formFor(['creature', 'clothing'], true)).toBe(
      'A {{creature}} wearing a {{clothing}}.'
    );
    expect(formFor(['adjective', 'creature', 'clothing'], true)).toBe(
      'A {{adjective}} {{creature}} wearing a {{clothing}}.'
    );
  });

  it('carries the lead in front', () => {
    expect(
      sentenceTemplate(
        withLead(CHARACTER.segments, 'Generate'),
        id => id === 'creature',
        () => false
      )
    ).toBe('Generate a {{creature}}.');
  });

  it('reads back only chosen words and filled phrases', () => {
    expect(
      readOnlyTemplate(CHARACTER, {creature: 'cat', clothing: clothing.id})
    ).toBe('A {{creature}} wearing a {{clothing}}.');
    expect(phraseFilled(CHARACTER, [{slot: 'clothing'}], {})).toBe(false);
  });
});

describe('splitTemplate', () => {
  it('follows the translation order', () => {
    expect(
      splitTemplate('Un {{creature}} {{adjective}}.', ['adjective', 'creature'])
    ).toEqual([
      {text: 'Un '},
      {slot: 'creature'},
      {text: ' '},
      {slot: 'adjective'},
      {text: '.'},
    ]);
  });

  it('appends a slot the translation dropped', () => {
    expect(
      splitTemplate('Un {{creature}}.', ['adjective', 'creature'])
    ).toEqual([
      {text: 'Un '},
      {slot: 'creature'},
      {text: '.'},
      {text: ' '},
      {slot: 'adjective'},
    ]);
  });

  it('places a repeated slot once and keeps an unknown one as text', () => {
    expect(
      splitTemplate('{{creature}} {{creature}} {{other}}', ['creature'])
    ).toEqual([
      {slot: 'creature'},
      {text: ' '},
      {text: ' '},
      {text: '{{other}}'},
    ]);
  });
});

describe('translateSentence', () => {
  it('sends the template with its slots as <var> elements', () => {
    expect(translateSentence('A {{adjective}} {{creature}}.')).toEqual([
      {text: 'Un '},
      {slot: 'creature'},
      {text: ' '},
      {slot: 'adjective'},
      {text: '.'},
    ]);
    const [sent, labels] = translate.mock.calls[0];
    expect((sent as HTMLElement).innerHTML).toBe(
      'A <var adjective="">adjective</var> <var creature="">creature</var>.'
    );
    expect(labels).toEqual(['spritelab-sentence']);
  });

  it('reads back a translation given as an HTML string', () => {
    translate.mockImplementation(
      () => 'Un <var creature>creature</var> <var adjective>adjective</var>.'
    );
    expect(translateSentence('A {{adjective}} {{creature}}.')).toEqual([
      {text: 'Un '},
      {slot: 'creature'},
      {text: ' '},
      {slot: 'adjective'},
      {text: '.'},
    ]);
  });

  it('reads back a phrase translated in place', () => {
    translate.mockImplementation((phrase: HTMLElement) => {
      phrase.innerHTML = '<var creature>creature</var> gris.';
      return phrase;
    });
    expect(translateSentence('A gray {{creature}}.')).toEqual([
      {slot: 'creature'},
      {text: ' gris.'},
    ]);
  });

  it('does not translate in English', () => {
    locale = 'en-US';
    expect(translateSentence('A {{creature}}.')).toEqual([
      {text: 'A '},
      {slot: 'creature'},
      {text: '.'},
    ]);
    expect(translate).not.toHaveBeenCalled();
  });
});

describe('templateToElement and elementToTemplate', () => {
  it('round-trip a template', () => {
    const template = 'Remove {{word}} from {{set}}';
    expect(
      elementToTemplate(templateToElement(template), ['word', 'set'])
    ).toBe(template);
  });

  it('match variable names whatever their case', () => {
    const phrase = document.createElement('span');
    phrase.innerHTML = '<var MYSLOT>x</var>!';
    expect(elementToTemplate(phrase, ['mySlot'])).toBe('{{mySlot}}!');
  });
});

describe('translateWord and translateText', () => {
  it('translates a word with its heading and strips the context', () => {
    expect(translateWord(cat!, CHARACTER.slots.creature)).toBe('gato');
    expect(translateWord(spooky!, CHARACTER.slots.adjective)).toBe(
      'espeluznante'
    );
  });

  it('fills interface text after translating it', () => {
    expect(translateText('Remove {{word}}', {word: 'gato'})).toBe(
      'Quitar gato'
    );
  });
});

describe('display text', () => {
  const choices = {adjective: 'spooky', creature: 'cat'};

  it('reads the sentence in the current language', () => {
    expect(sentenceDisplayText(CHARACTER, choices)).toBe(
      'Un gato espeluznante.'
    );
  });

  it('leaves the prompt sent to the model in English', () => {
    expect(promptText(CHARACTER, choices)).toBe('A spooky cat');
  });

  it('rebuilds an image from its choices, but not a typed prompt', () => {
    expect(
      displayTextFromImage({
        prompt: 'A spooky cat',
        imageType: 'sprite',
        subject: 'character',
        sentenceId: 'character',
        choices,
      } as never)
    ).toBe('Un gato espeluznante.');
    expect(
      displayTextFromImage({
        prompt: 'a dragon made of cheese',
        imageType: 'sprite',
        subject: 'character',
      } as never)
    ).toBe('a dragon made of cheese');
  });
});
