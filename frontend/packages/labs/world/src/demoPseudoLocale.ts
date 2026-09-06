// A locale for the demo, so that "is this translated?" can be looked at.
//
// The lab translates through `@code-dot-org/core/plugins/localization`, which
// is identity until LocalizeJS is loaded — and LocalizeJS is not loaded here,
// or in any test, which is exactly why the seam costs nothing. It also means
// the whole of `localizeBlocks`/`localizeToolbox` is invisible in a browser
// until a real locale exists, and a seam nobody can look at is a seam nobody
// can check.
//
// So this stands in for LocalizeJS under `?pseudo=1`: every string comes back
// bracketed, accented and a third longer. Nothing is a real translation and
// nothing is meant to be — what it answers is which words reach the seam and
// which are still drawn in English, which is a question about this lab's
// wiring rather than about anybody's language.
//
//   yarn dev:isolated
//   open http://localhost:5139/?pseudo=1
//
// LOADED BY ITS OWN SCRIPT TAG, before the bundle (index.html), and it has to
// be. The localization singleton binds to `window.LocalizeLoader` when its
// MODULE is evaluated, and an `import` is hoisted above every statement — so
// installing this from inside main.tsx was installing it after the thing that
// reads it, and the whole page came up in English with no complaint. A real
// LocalizeJS arrives the same way: a script in the page, ahead of the app.

/** Latin letters that read as themselves with an accent on top. */
const ACCENTED: Record<string, string> = {
  a: 'á',
  e: 'é',
  i: 'í',
  o: 'ó',
  u: 'ú',
  n: 'ñ',
  c: 'ç',
  s: 'š',
  y: 'ý',
  A: 'Á',
  E: 'É',
  I: 'Í',
  O: 'Ó',
  U: 'Ú',
  N: 'Ñ',
  C: 'Ç',
  S: 'Š',
  Y: 'Ý',
};

/**
 * Marked, accented, and left interpolating exactly what it interpolated.
 *
 * `%1` and `%%` are stepped over: a pseudo-locale that renamed an argument
 * index would be refused by `safeMessage` and fall back to English, which
 * would make every block look correctly translated by looking untranslated.
 */
const mangle = (text: string): string =>
  `«${text.replace(/%\d+|%%|[A-Za-z]/g, token =>
    token.length > 1 || token === '%%' ? token : (ACCENTED[token] ?? token),
  )}»`;

/** The locale code this pretends to be. `qps` is the usual one for a pseudo. */
const LOCALE = 'qps';

/**
 * The few methods `Localization` actually calls on LocalizeJS.
 *
 * `on('dictionaryAdded')` IS THE IMPORTANT ONE, and leaving it inert is why
 * the first draft of this showed a page of untranslated English. The plugin
 * hands LocalizeJS its callbacks and waits: nothing is drawn in another
 * language until a dictionary is announced, because until then there is
 * nothing to translate with. Answering the registration with the announcement
 * is what makes the plugin emit `change`, which is what `useLocalization`
 * watches and what re-runs the seam over blocks that were built in English.
 *
 * So this is not only a fake dictionary — it is a fake dictionary ARRIVING,
 * which is the path a real locale takes and the one worth exercising.
 */
const stub = {
  translate: (payload: string | HTMLElement) =>
    typeof payload === 'string' ? mangle(payload) : payload,
  getLanguage: () => LOCALE,
  setLanguage: () => {},
  on: (event: string, callback: (locale: string) => void) => {
    if (event === 'dictionaryAdded') {
      // After the plugin has finished wiring itself up, not during it.
      setTimeout(() => callback(LOCALE), 0);
    }
  },
  getAvailableLanguages: (
    callback: (
      error: unknown,
      data: Array<{name: string; code: string}>,
    ) => void,
  ) => callback(null, [{name: 'Pseudo', code: LOCALE}]),
};

/** Install the pseudo-locale if the URL asks for it. */
export function installPseudoLocale(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!new URLSearchParams(window.location.search).has('pseudo')) {
    return false;
  }
  (window as {LocalizeLoader?: Promise<unknown>}).LocalizeLoader =
    Promise.resolve(stub);
  return true;
}

// On import, which is the point of importing it.
installPseudoLocale();
