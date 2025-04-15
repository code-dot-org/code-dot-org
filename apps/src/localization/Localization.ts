export type TranslatableHash = {[key: string]: string};

/**
 * The possible input types for translation. We can translate just raw strings, a list
 * of such strings, a piece of the document as a DOM element, or a key-value store.
 */
export type Translatable = string[] | string | HTMLElement | TranslatableHash;

export type TranslationCallback = (code: string) => void;

import {get} from 'js-cookie';

import Localize, {
  LocalizeOptions,
  LocalizeSetLanguageData,
} from '@cdo/apps/localization/Localize';
import experiments from '@cdo/apps/util/experiments';
import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';

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

    Localize?.on('setLanguage', data => {
      // Call our own 'change' event
      const language = (data as LocalizeSetLanguageData).to;
      this.trigger('change', language || 'en');
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
    if (!Localize) {
      // If not using LocalizeJS, then pull from the language cookie
      return get('language_') || DefaultLocale;
    }
    return Localize?.getLanguage() || DefaultLocale;
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
      if (Localize && (Localize.getLanguage() || 'en') !== 'en') {
        this.trigger('change', Localize.getLanguage() || 'en');
      }
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
  trigger(event: string, data: string) {
    const callbacks = this.callbacks[event] || [];
    for (const callback of callbacks) {
      callback(data);
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
