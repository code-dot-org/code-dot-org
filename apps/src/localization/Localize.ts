/**
 * The possible options that can be given to the LocalizeJS widget and the
 * possible argument in the 'initialize' event callback.
 */
export type LocalizeOptions = {
  /**
   * The project key.
   */
  key: string;
  /**
   * Defaults to false. If true, whenever you have a <BR> element in your content,
   * Localize will not break up the parent element's content but instead will keep
   * all sibling child elements together in the parent or containing element.
   */
  allowInlineBreakTags?: boolean;
  /**
   * Defaults to false. If true and you have machine translations enabled, any
   * new phrases found in your website will be automatically moved to the Published
   * bin, and a machine translation will be generated.
   */
  autoApprove?: boolean;
  /**
   * Defaults to true. Automatically set the language to the detected language.
   */
  autodetectLanguage?: boolean;
  /**
   * This specifies the 'base' or 'root' path of your application. This will be
   * stripped from the URL of the phrase when seen in the "Filter by pages" feature.
   */
  basePath?: string;
  /**
   * An array of CSS class selectors. When applied, any phrase(s) contained inside an
   * HTML element with the class(es) will not be brought into the Localize dashboard,
   * allowing you to filter out your unwanted content.
   *
   * Conversely, if you add a class to this list after there is already content in the
   * Localize dashboard, Localize will not display any translations within that HTML
   * element, even if they exist.
   */
  blockedClasses?: string[];
  /**
   * An array of CSS ID selectors. When applied, any phrase(s) contained inside an HTML
   * element with one of the ID(s) will not be brought into the Localize dashboard,
   * allowing you to filter out your unwanted content.
   *
   * If you add an ID to this list after there is already content in the Localize
   * dashboard, Localize will not display any translations within that HTML element,
   * even if they exist.
   */
  blockedIds?: string[];
  /**
   * Localize will set the initial language on your website to `LANG_CODE`. Defaults
   * to the source language of your website.
   */
  defaultLanguage?: string;
  /**
   * Defaults to false. When true, the default Localize language-switching widget is
   * hidden in your web pages (via CSS).
   */
  disableWidget?: boolean;
  /**
   * An array of language codes that determine which target languages should be shown
   * on the default Localize language-switching widget.
   */
  enabledLanguages?: string[];
  /**
   * Defaults to false. If true, the image URLs used in your website will appear in
   * your phrases bin to allow for image replacement based on language.
   */
  localizeImages?: boolean;
  /**
   * Defaults to false. If true, Localize will remember the user’s previous language
   * choice and will translate your website to that language.
   */
  rememberLanguage?: boolean;
  /**
   * Defaults to false. If set to true, Localize will automatically translate
   * content that is added dynamically to your webpage.
   */
  retranslateOnNewPhrases?: boolean;
  /**
   * Defaults to true. If true, unrecognized phrases will be added to your Localize
   * account.
   */
  saveNewPhrases?: boolean;
  /**
   * Defaults to false. New phrases are only detected when a user is displaying a
   * page in a target language. If true, Localize will detect phrases only when
   * the user is viewing a page in the source language.
   */
  saveNewPhrasesFromSource?: boolean;
  /**
   * Localize will set the target language of your website to the specified language,
   * ignoring the cookie that Localize normally saves in the user's browser.
   */
  targetLanguage?: string;
  /**
   * Defaults to true. If true, alt attributes within HTML elements will be found by
   * Localize and brought into the dashboard, allowing you to translate them.
   */
  translateAlt?: boolean;
  /**
   * Defaults to true. If true, aria-label attributes within HTML elements will be
   * found by Localize and brought into the dashboard, allowing you to translate
   * them.
   */
  translateAriaLabels?: boolean;
  /**
   * Defaults to true. If true, Localize will translate the contents in the entire
   * `<body>` element of the page. If false, Localize will only translate the
   * content within an HTML element(s) that contains the attribute
   * `class="localizejs"` or `id="localizejs"`.
   */
  translateBody?: boolean;
  /**
   * An array of class names for which Localize will translate. If you use this
   * option, Localize will ONLY translate content contained in these classes and
   * will ignore all other content in the body of the page.
   */
  translateClasses?: string[];
  /**
   * Defaults to true. If true, metadata tags in the <head> section of the web
   * page will be found by Localize and brought into the dashboard, allowing
   * you to translate them.
   */
  translateMetaTags?: boolean;
  /**
   * Defaults to false. If true, the Localize library will pick up numbers as
   * phrases. For example: `<p>43525234543<p>` will be saved as a phrase when
   * set to true.
   */
  translateNumbers?: boolean;
  /**
   * Defaults to true. If true, text contained within SVGs will be found by
   * Localize and brought into the dashboard, allowing you to translate the
   * text. (SVG files are not supported)
   */
  translateSVGElement?: boolean;
  /**
   * Defaults to false. If true, the Localize library will pick up phrases
   * in `<time>` elements. For example: `<time>July 7</time>` will be saved
   * as a phrase when set to true.
   */
  translateTimeElement?: boolean;
  /**
   * Defaults to true. If true, the `<title>` tag of the page in the `<head>`
   * section of the web page will be translatable.
   */
  translateTitle?: boolean;
  /**
   * Defaults to false. If true, when a target language is selected in the
   * default Localize language-switching widget, the system will add the
   * appropriate language code to the current page's URL.
   */
  useSubdirectoriesWithWidget?: boolean;
  /**
   * Defaults to false. If true, when a target language is selected in the
   * default Localize language-switching widget, the system will add the
   * appropriate language code to the current page's URL.
   */
  useSubdomainsWithWidget?: boolean;
  /**
   * Defaults to false. Set this to true if you are working on a website that
   * uses the Vue.js framework to build your website to avoid DOM-based
   * conflicts.
   */
  vueSafe?: boolean;
};

export type LocalizeLanguageInfo = {
  code: string;
  name: string;
};

/**
 * The argument given to the callback for the 'setLanguage' event callback.
 */
export type LocalizeSetLanguageData = {
  from: string;
  to: string;
};

/**
 * The argument given to the callback for the 'updatedDictionary' event
 * callback.
 */
export type LocalizeUpdatedDictionaryData = {
  version: number;
  language: string;
  dictionary: {
    [key: string]: string;
  };
};

/**
 * The argument given to the callback for an 'error' event.
 */
export type LocalizeErrorData = string;

/**
 * All possible Localize.on event callback arguments.
 */
export type LocalizeCallbackData =
  | LocalizeOptions
  | LocalizeSetLanguageData
  | LocalizeUpdatedDictionaryData
  | LocalizeErrorData
  | undefined;

/**
 * The LocalizeJS frontend API object.
 */
interface LocalizeJS {
  /**
   * Translates the page into the given language.
   */
  setLanguage: (languageCode: string) => void;
  /**
   * Returns the language code for the source language of the current project.
   */
  getSourceLanguage: () => string;
  /**
   * Returns the language code for the current language of the page. If a
   * language hasn't been set, the language code of the source language is
   * returned.
   */
  getLanguage: () => string;
  /**
   * Returns the visitor's list of preferred languages, based on the browser's
   * `accept-language` header.
   */
  detectLanguage: (
    callback: (err: string | undefined, languages: string[]) => void
  ) => void;
  /**
   * Returns all available languages for the project.
   */
  getAvailableLanguages: (
    callback: (
      err: string | undefined,
      languages: LocalizeLanguageInfo[]
    ) => void
  ) => void;
  /**
   * Calling this function will hide the default Localize language-switching
   * widget if it's currently visible. You can use this function to hide the
   * widget on certain pages.
   */
  hideWidget: () => void;
  /**
   * Calling this function will show the default Localize language-switching
   * widget if it's currently hidden.
   */
  showWidget: () => void;
  /**
   * Call this method to remove languages from the Localize default
   * language-switching widget.
   */
  hideLanguagesInWidget: (languages: string[]) => void;
  /**
   * Call this method to set the languages you'd like to have active in the
   * Localize default language-switching widget.
   */
  setWidgetLanguages: (languages: string[]) => void;
  /**
   * Retrieves the translation for an existing source phrase in the currently
   * active language, or adds a new source phrase using the contents in the
   * input parameter. input can be plain text or text within HTML, and can
   * optionally contain variable data.
   *
   * `Localize.translate` can be used with or without a callback. We highly
   * recommend using the callback approach if you're calling `Localize.translate`
   * in the first 10 seconds of page load to ensure that the latest translations
   * are available. The callback will allow the translation to be delayed until
   * translations have been fully loaded into the browser. If the translations
   * are already loaded, the callback is executed immediately.
   */
  translate: <T = string | string[] | HTMLElement>(
    key: T,
    variables?: {[key: string]: string | number} | ((translation: T) => void),
    callback?: (translation: T) => void
  ) => T;
  /**
   * Untranslates a specified element on the page.
   *
   * Use `Localize.untranslatePage()` if untranslating the whole page.
   */
  untranslate: (element: HTMLElement) => void;
  /**
   * Returns the DOM node (or nodes) within the <body> tag that was (were)
   * translated, based on your initialization settings, using the currently
   * selected language.
   */
  translatePage: () => void;
  /**
   * Untranslates all text on the page and switches the language back to the
   * source language.
   */
  untranslatePage: () => void;
  /**
   * Speed up language switching by prefetching translations by language.
   */
  prefetch: (languages: string | string[]) => void;
  /**
   * Saves the phrase, if unrecognized, to your Localize project. Useful
   * for ensuring rarely printed text (ie. an obscure error message) is
   * translated. Returns the phrase it was passed.
   */
  phrase: <T = string | string[]>(key: T) => T;
  /**
   * Attach an event handler to Localize events.
   */
  on: (eventName: string, fn: (data: LocalizeCallbackData) => void) => void;
  /**
   * Remove an event handler.
   */
  off: (eventName: string, fn?: (data: LocalizeCallbackData) => void) => void;
  /**
   * Convert the format of a number to the format used in the currently selected
   * language/locale.
   */
  number: (
    originalValue: number,
    callback: (err: string, value: string) => void
  ) => void;
  /**
   * Convert a monetary value from one currency to another, using the current
   * exchange rate. Rates are updated hourly.
   */
  currency: (
    originalValue: number,
    options: {fromCurrency: string; toCurrency: string},
    callback: (err: string, value: number) => void
  ) => void;
  /**
   * Returns the exchange rate between the provided currencies. Rates are updated hourly.
   */
  getExchangeRate: (
    fromCurrency: string,
    toCurrency: string,
    callback: (
      err: string,
      rateData: {fromCurrency: string; toCurrency: string; rate: number}
    ) => void
  ) => void;
}

declare global {
  interface Window {
    Localize: LocalizeJS | undefined;
  }
}

export {LocalizeJS};

const Localize = typeof window !== 'undefined' ? window.Localize : undefined;

export {Localize};

export default Localize;
