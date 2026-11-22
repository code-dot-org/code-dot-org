/**
 * @vitest-environment jsdom
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import type {LocalizeJS} from '../Localize';
import {
  DefaultLocalizeOptions,
  LOCALIZE_SCRIPT_URL,
  loadLocalize,
} from '../loadLocalize';
import {createLocalizationPlugin} from '../index';

function fakeLocalize(language = 'en') {
  return {
    initialize: vi.fn(),
    setLanguage: vi.fn(),
    getLanguage: vi.fn(() => language),
    hideWidget: vi.fn(),
    on: vi.fn(),
    getAvailableLanguages: vi.fn(),
  };
}

function localizeScript(): HTMLScriptElement | null {
  return document.head.querySelector(`script[src="${LOCALIZE_SCRIPT_URL}"]`);
}

beforeEach(() => {
  delete window.LocalizeLoader;
  delete window.Localize;
  document.head.innerHTML = '';
  document.documentElement.removeAttribute('dir');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadLocalize', () => {
  it('injects the script and publishes window.LocalizeLoader', () => {
    const loader = loadLocalize({key: 'abc'});
    expect(localizeScript()).not.toBeNull();
    expect(window.LocalizeLoader).toBe(loader);
  });

  it('initializes with the apps/ defaults and saving off', async () => {
    const loader = loadLocalize({key: 'abc'});
    const Localize = fakeLocalize();
    window.Localize = Localize as unknown as LocalizeJS;
    localizeScript()!.onload!(new Event('load'));

    expect(await loader).toBe(Localize);
    expect(Localize.initialize).toHaveBeenCalledWith({
      key: 'abc',
      rememberLanguage: true,
      retranslateOnNewPhrases: true,
      disableWidget: true,
      allowIgnoredChildrenInIsolate: true,
      saveNewPhrases: false,
    });
    expect(Localize.hideWidget).toHaveBeenCalled();
    expect(DefaultLocalizeOptions.saveNewPhrases).toBe(false);
  });

  it('lets callers override the defaults', async () => {
    const loader = loadLocalize({key: 'abc', saveNewPhrases: true});
    const Localize = fakeLocalize();
    window.Localize = Localize as unknown as LocalizeJS;
    localizeScript()!.onload!(new Event('load'));
    await loader;

    expect(Localize.initialize).toHaveBeenCalledWith(
      expect.objectContaining({saveNewPhrases: true}),
    );
  });

  it('sets the document direction when the language changes', async () => {
    const loader = loadLocalize({key: 'abc'});
    const Localize = fakeLocalize();
    const setLanguage = Localize.setLanguage;
    window.Localize = Localize as unknown as LocalizeJS;
    localizeScript()!.onload!(new Event('load'));
    await loader;

    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    window.Localize!.setLanguage('fa');
    expect(setLanguage).toHaveBeenCalledWith('fa');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('resolves undefined when the script fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const loader = loadLocalize({key: 'abc'});
    localizeScript()!.onerror!(new Event('error'));
    expect(await loader).toBeUndefined();
  });

  it("reuses the host page's loader and ignores the key", () => {
    const existing = Promise.resolve(fakeLocalize() as unknown as LocalizeJS);
    window.LocalizeLoader = existing;
    expect(loadLocalize({key: 'abc'})).toBe(existing);
    expect(localizeScript()).toBeNull();
  });
});

describe('createLocalizationPlugin', () => {
  const onCoreReady = (plugin: ReturnType<typeof createLocalizationPlugin>) =>
    plugin.onCoreReady({} as Parameters<typeof plugin.onCoreReady>[0]);

  it('loads LocalizeJS when given a key', () => {
    onCoreReady(createLocalizationPlugin({key: 'abc'}));
    expect(localizeScript()).not.toBeNull();
  });

  it('loads nothing without a key', () => {
    onCoreReady(createLocalizationPlugin());
    expect(localizeScript()).toBeNull();
    expect(window.LocalizeLoader).toBeUndefined();
  });
});
