import localization from '@cdo/apps/localization';
import {unlocalizeColor} from '@cdo/apps/p5lab/spritelab/localizedColors';

// State lives in the factory: localizedColors subscribes to 'change' while
// it is imported, before this file's own constants exist.
jest.mock('@cdo/apps/localization', () => {
  const dictionary: {[source: string]: string} = {};
  const listeners: (() => void)[] = [];
  return {
    __esModule: true,
    default: {
      dictionary,
      listeners,
      translate: jest.fn((text: string) => dictionary[text] ?? text),
      on: (event: string, listener: () => void) => {
        if (event === 'change') {
          listeners.push(listener);
        }
      },
    },
  };
});

type MockLocalization = {
  dictionary: {[source: string]: string};
  listeners: (() => void)[];
  translate: jest.Mock;
};
const mock = localization as unknown as MockLocalization;
const mockDictionary = mock.dictionary;
const mockTranslate = mock.translate;

function changeLocale(dictionary: {[source: string]: string}): void {
  for (const key of Object.keys(mockDictionary)) {
    delete mockDictionary[key];
  }
  Object.assign(mockDictionary, dictionary);
  mock.listeners.forEach(listener => listener());
}

describe('unlocalizeColor', () => {
  beforeEach(() => {
    changeLocale({});
    mockTranslate.mockClear();
  });

  it('maps a translated name back to its HTML colour name', () => {
    changeLocale({red: 'rojo', blue: 'azul'});
    expect(unlocalizeColor('rojo')).toBe('red');
    expect(unlocalizeColor('azul')).toBe('blue');
  });

  it('passes HTML colour names and other CSS colours through', () => {
    changeLocale({red: 'rojo'});
    expect(unlocalizeColor('red')).toBe('red');
    expect(unlocalizeColor('#ff0000')).toBe('#ff0000');
    expect(unlocalizeColor('#f00')).toBe('#f00');
    expect(unlocalizeColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)');
    expect(unlocalizeColor('not a colour')).toBe('not a colour');
  });

  it('rebuilds when the dictionary arrives after the first lookup', () => {
    expect(unlocalizeColor('rojo')).toBe('rojo');
    changeLocale({red: 'rojo'});
    expect(unlocalizeColor('rojo')).toBe('red');
  });

  it('rebuilds when the language switches', () => {
    changeLocale({red: 'rojo'});
    expect(unlocalizeColor('rojo')).toBe('red');
    changeLocale({red: 'rouge'});
    expect(unlocalizeColor('rouge')).toBe('red');
    expect(unlocalizeColor('rojo')).toBe('rojo');
  });

  it('ignores case and surrounding spaces', () => {
    changeLocale({red: 'Rojo'});
    expect(unlocalizeColor(' ROJO ')).toBe('red');
  });

  it('keeps the first colour when two share a translation', () => {
    changeLocale({aqua: 'cian', cyan: 'cian'});
    expect(unlocalizeColor('cian')).toBe('aqua');
  });

  it('prefers an HTML colour name over a translation spelled the same', () => {
    changeLocale({orange: 'tan'});
    expect(unlocalizeColor('tan')).toBe('tan');
  });

  it('builds the map once between locale changes', () => {
    changeLocale({red: 'rojo'});
    unlocalizeColor('rojo');
    const calls = mockTranslate.mock.calls.length;
    unlocalizeColor('rojo');
    unlocalizeColor('azul');
    expect(mockTranslate.mock.calls.length).toBe(calls);
  });
});
