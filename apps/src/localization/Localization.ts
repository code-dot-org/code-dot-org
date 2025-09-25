import {EventEmitter} from 'events';
import {get} from 'js-cookie';

import type {
  LocalizeJS,
  LocalizeOptions,
} from '@cdo/apps/localization/Localize';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';
import {DefaultLocale} from '@cdo/generated-scripts/sharedConstants';

declare global {
  interface Window {
    LocalizeLoader?: Promise<LocalizeJS>;
    newrelic?: {
      noticeError: (err: Error) => void;
    };
  }
}

export const RTLLocales = ['fa'];

export type TranslatableHash = {[key: string]: string};

/**
 * The possible input types for translation. We can translate just raw strings, a list
 * of such strings, a piece of the document as a DOM element, or a key-value store.
 */
export type Translatable = string[] | string | HTMLElement | TranslatableHash;

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

export interface LocalizationChangeEvent {
  locale: string;
  rtl: boolean;
}

export interface LocalizationEventMap {
  change: LocalizationChangeEvent;
}

type Listener<T> = (payload: T) => void;

// A type mapping for the event emitter
class TypedEventEmitter<
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- any callback data */
  Events extends Record<string, any>
> extends EventEmitter {
  override on<K extends keyof Events>(
    event: K | symbol | string,
    listener: Listener<Events[K]>
  ): this {
    return super.on(event as string, listener);
  }

  override once<K extends keyof Events>(
    event: K | symbol | string,
    listener: Listener<Events[K]>
  ): this {
    return super.once(event as string, listener);
  }

  override off<K extends keyof Events>(
    event: K | symbol | string,
    listener: Listener<Events[K]>
  ): this {
    return super.off(event as string, listener);
  }

  override emit<K extends keyof Events>(
    event: K | symbol | string,
    payload: Events[K]
  ): boolean {
    return super.emit(event as string, payload);
  }

  override addListener<K extends keyof Events>(
    event: K | symbol | string,
    listener: Listener<Events[K]>
  ): this {
    return super.addListener(event as string, listener);
  }

  override removeListener<K extends keyof Events>(
    event: K | symbol | string,
    listener: Listener<Events[K]>
  ): this {
    return super.removeListener(event as string, listener);
  }
}

/**
 * This class handles our dynamic localization engine.
 */
export class Localization extends TypedEventEmitter<LocalizationEventMap> {
  /* Keep track of the options we gave to LocalizeJS */
  private options: LocalizeOptions | undefined;

  private localeList: LanguageInfo[] = [];
  private Localize: LocalizeJS | undefined;
  private loader?: Promise<boolean>;

  /**
   * Instantiates our localization code and binds events to the LocalizeJS
   * widget.
   */
  constructor() {
    super();

    this.localeList = [];

    // Only allow when enableExperiments=localizejs has been set
    // or localizejs=1 is specified in the URL
    if (!experiments.isEnabledAllowingQueryString(experiments.LOCALIZEJS)) {
      return;
    }

    this.loader = new Promise(resolve => {
      window.LocalizeLoader?.then(loadedLocalize => {
        this.Localize = loadedLocalize;

        // Hook into the widget code
        this.Localize?.on?.('initialize', options => {
          this.options = options as LocalizeOptions;
        });

        this.Localize?.on?.('setLanguage', _ => {
          // Call our own 'change' event
          this.emit('change', {locale: this.locale, rtl: this.rtl});
        });

        this.Localize?.getAvailableLanguages?.((_, data) => {
          this.localeList = data.map(({name, code}) => ({
            text: name,
            value: code,
            rtl: this.isRTL(code),
          }));
        });

        resolve(true);
      }).catch(err => {
        // There was an error loading the Localize library, so log that via NewRelic
        window.newrelic?.noticeError?.(err);
      });

      if (window.LocalizeLoader === undefined) {
        resolve(false);
      }
    });
  }

  async waitUntilLoaded(): Promise<boolean> {
    if (this.loader === undefined) {
      return true;
    }

    return await this.loader;
  }

  /**
   * Updates the locale to the given region code.
   */
  set locale(languageCode: string) {
    this.Localize?.setLanguage?.(languageCode);
  }

  /**
   * Gets the current locale as a region code.
   */
  get locale(): string {
    // If not using LocalizeJS, then pull from the language cookie
    // And always fall back to the DefaultLocale
    const language =
      this.Localize?.getLanguage?.() || get('language_') || DefaultLocale;

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
    type ScriptData = {localeOptions: Omit<LanguageInfo, 'rtl'>[]};

    if (this.localeList.length === 0) {
      // Localize has not given us any languages... build from the existing
      // localization dropdown.
      let scriptData: ScriptData | undefined = undefined;
      try {
        scriptData = getScriptData('smallfooter') as ScriptData | undefined;
      } catch (_) {
        // Ignore the situation where the small or large footer doesn't exist
      }

      this.localeList = (scriptData?.localeOptions || []).map(
        ({text, value}) => ({
          text,
          value,
          rtl: this.isRTL(value),
        })
      );
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

  override on<K extends keyof LocalizationEventMap>(
    event: K,
    listener: (payload: LocalizationEventMap[K]) => void
  ): this {
    return super.on(event, listener);

    // Ensure that we call the 'change' event at least once
    if (event === 'change') {
      this.emit('change', {locale: this.locale, rtl: this.rtl});
    }
  }

  override addListener<K extends keyof LocalizationEventMap>(
    event: K,
    listener: (payload: LocalizationEventMap[K]) => void
  ): this {
    // We have to override this to ensure `addListener` is an alias to `on`
    return this.on(event, listener);
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
    this.translate(key, labels);
    return key;
  }

  /**
   * Whether or not the given language code represents a right-to-left language.
   *
   * @param code - The language code (e.g. 'en-US')
   */
  isRTL(code: string): boolean {
    return RTLLocales.includes(code?.split('-')[0]);
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
      return key.map(key => this.translate(key, labels)) as T;
    } else if (key instanceof HTMLElement) {
      // Add labels as data-localize before sending
      key.setAttribute('data-localize', labels.join(' '));
      const ret = this.Localize?.translate?.(key) || (key as T);
      // Remove the labels
      key.removeAttribute('data-localize');
      return ret;
    } else if (typeof key === 'string') {
      // Calls out to LocalizeJS, our third-party provider, to get the translation
      let payload: string | HTMLElement = key;
      if (labels.length > 0) {
        const dummy = document.createElement('span');
        dummy.setAttribute('data-localize', labels.join(' '));
        dummy.textContent = payload;
        payload = dummy;
      }
      const ret = this.Localize?.translate?.(payload) || payload;
      if (ret instanceof HTMLElement) {
        return ((ret as HTMLElement).textContent || key) as T;
      }
      return ret as T;
    } else {
      const ret: TranslatableHash = {};
      for (const [subkey, value] of Object.entries(key)) {
        ret[subkey] = this.translate(value, labels);
      }
      return ret as T;
    }
  }
}

export default new Localization();
