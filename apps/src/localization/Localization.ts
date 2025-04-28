export type TranslatableHash = {[key: string]: string};

/**
 * The possible input types for translation. We can translate just raw strings, a list
 * of such strings, a piece of the document as a DOM element, or a key-value store.
 */
export type Translatable = string[] | string | HTMLElement | TranslatableHash;

export type TranslationCallbackData = {
  code: string;
  rtl: boolean;
};

export type TranslationCallback = (info: TranslationCallbackData) => void;

import {get} from 'js-cookie';

import Localize, {LocalizeOptions} from '@cdo/apps/localization/Localize';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';
import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';

/**
 * Describes an available language.
 */
export type LanguageInfo = {
  /**
   * The localized name of the language. "English" or "Español", for example.
   */
  text: string;
  /**
   * The language code. "en" or "hi-IN", for example.
   */
  value: string;
  /**
   * Whether or not it is right-to-left.
   */
  rtl: boolean;
};

/**
 * This class handles our dynamic localization engine.
 */
export class Localization {
  /**
   * Keeps track of the only instance of the Localization class.
   */
  static singleton: Localization | undefined;

  /* Keep track of callbacks for events */
  private callbacks: {[key: string]: TranslationCallback[]} = {};
  /* Keep track of the options we gave to LocalizeJS */
  private options: LocalizeOptions | undefined;

  private localeList: LanguageInfo[] = [];

  /**
   * Instantiates our localization code and binds events to the LocalizeJS
   * widget.
   */
  constructor() {
    // Only allow when enableExperiments=localizejs has been set
    // or localizejs=1 is specified in the URL
    if (!experiments.isEnabledAllowingQueryString(experiments.LOCALIZEJS)) {
      return;
    }

    // Hook into the widget code
    Localize?.on('initialize', options => {
      this.options = options as LocalizeOptions;
    });

    Localize?.on('setLanguage', _ => {
      // Call our own 'change' event
      this.trigger('change', {
        code: this.locale,
        rtl: this.rtl,
      });
    });

    Localize?.getAvailableLanguages((_, data) => {
      this.localeList = data.map(({name, code}) => ({
        text: name,
        value: code,
        rtl: this.isRTL(code),
      }));
    });
  }

  /**
   * Updates the locale to the given region code.
   */
  set locale(languageCode: string) {
    Localize?.setLanguage(languageCode);
  }

  /**
   * Gets the current locale as a region code.
   */
  get locale(): string {
    // If not using LocalizeJS, then pull from the language cookie
    // And always fall back to the DefaultLocale
    const language =
      Localize?.getLanguage() || get('language_') || DefaultLocale;

    return (
      this.localeList.find(info => info.value === language)?.value ||
      this.localeList.find(info => info.value.startsWith(language))?.value ||
      language
    );
  }

  /**
   * Whether or not the current locale is right-to-left.
   */
  get rtl(): boolean {
    return this.isRTL(this.locale);
  }

  /**
   * The list of languages we currently support for the current page.
   */
  get locales(): LanguageInfo[] {
    // These workarounds will go away when the localization is done completely
    // on the frontend.
    if (this.localeList.length === 0) {
      // Localize has not given us any languages... build from the existing
      // localization dropdown.
      this.localeList = (
        (
          getScriptData('smallfooter') as
            | {localeOptions: Omit<LanguageInfo, 'rtl'>[]}
            | undefined
        )?.localeOptions || []
      ).map(({text, value}) => ({
        text,
        value,
        rtl: this.isRTL(value),
      }));
    }

    if (this.localeList.length === 0) {
      // There's no small footer either (or no smallfooter data)
      // Query the locale dropdown on the page and read from the <option> listings
      this.localeList = Array.from(
        document.querySelectorAll('select#locale option')
      ).map(option => ({
        text: option.textContent as string,
        value: (option as HTMLInputElement).value,
        rtl: this.isRTL((option as HTMLInputElement).value),
      }));
    }

    return this.localeList;
  }

  /**
   * Registers a callback for the given event.
   *
   * @param event - The name of the event to register.
   * @param callback - The callback to perform when the event is triggered.
   */
  on(event: string, callback: TranslationCallback): void {
    this.callbacks ||= {};
    this.callbacks[event] ||= [];
    this.callbacks[event].push(callback);

    if (event === 'change') {
      // If we aren't in the source language, let's trigger the change event
      // right away.
      this.trigger('change', {
        code: this.locale,
        rtl: this.rtl,
      });
    }
  }

  /**
   * Deregisters a callback for the given event.
   *
   * @param event - The name of the event to deregister.
   * @param callback - The callback that was registered.
   */
  off(event: string, callback: TranslationCallback): void {
    this.callbacks ||= {};
    this.callbacks[event] = (this.callbacks[event] || []).filter(
      item => item !== callback
    );
  }

  /**
   * Triggers an event with the given data to provide to the event callbacks.
   *
   * @param event - The name of the event to trigger.
   * @param data - The data to pass to the previously registered event callbacks.
   */
  trigger(event: string, info: TranslationCallbackData) {
    const callbacks = this.callbacks[event] || [];
    for (const callback of callbacks) {
      callback(info);
    }
  }

  /**
   * This will ensure that the given string is sent to the translation
   * manager for translation, but does not return the translated string.
   *
   * It always returns what it is sent.
   *
   * See `translate` for more explanation of labels.
   *
   * @param key - The source text, typically English text, or original text.
   * @param labels - Optional set of categorical labels to attach to the text.
   */
  translatable(key: string, labels: string[] = []): string {
    this.translate(key);
    return key;
  }

  /**
   * Whether or not the given language code represents a right-to-left language.
   *
   * @param code - The language code (e.g. 'en-US')
   */
  isRTL(code: string): boolean {
    return ['fa'].includes(code.split('-')[0]);
  }

  /**
   * Translates the given translatable input and provides an output matching the
   * same type and structure but with the translated content.
   *
   * Optionally, one can add one or more labels to the strings so they are annotated
   * for translators. Note: Our translation system may not see labels if they are
   * newly applied labels to existing strings.
   *
   * @param key - The input content to translate.
   * @param labels - One or more strings to use to annotate the string.
   */
  translate<T extends string | string[] | HTMLElement | TranslatableHash>(
    key: T,
    labels: string[] = []
  ): T {
    if (Array.isArray(key)) {
      //key = key as unknown as string[];
      return key.map(key => this.translate(key, labels)) as T;
    } else if (key instanceof HTMLElement) {
      // TODO: add labels to data-localize attribute before sending
      return Localize?.translate(key) || (key as T);
    } else if (typeof key === 'string') {
      // Calls out to LocalizeJS, our third-party provider, to get the translation
      let payload: string | HTMLElement = key;
      if (labels.length > 0) {
        const dummy = document.createElement('span');
        dummy.setAttribute('data-localize', labels.join(' '));
        dummy.textContent = payload;
        payload = dummy;
      }
      const ret = Localize?.translate(payload) || payload;
      if (ret instanceof HTMLElement) {
        return ((ret as HTMLElement).textContent || key) as T;
      }
      return ret as T;
    } else {
      //key = key as TranslatableHash;
      const ret: TranslatableHash = {};
      for (const [subkey, value] of Object.entries(key)) {
        ret[subkey] = this.translate(value, labels);
      }
      return ret as T;
    }
  }

  /**
   * Retrieves a list of supported language codes.
   */
  languages(): string[] {
    return [];
  }
}

/**
 * Gets an instance to the Localization instance.
 */
export const localization = () => {
  Localization.singleton ||= new Localization();
  return Localization.singleton;
};

export default localization;
