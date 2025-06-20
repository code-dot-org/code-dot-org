import localization from '@cdo/apps/localization';
import msg from '@cdo/poetry/locale';

import {POEMS, PoetryStandaloneApp, TIME_CAPSULE_POEMS} from './constants';

export function getPoem(key) {
  const poemList = getPoems();
  if (!key || !poemList[key]) {
    return undefined;
  }

  // If we are using LocalizeJS, we want to pull from that dictionary.
  // We have to be careful since we do not have the source string unless
  // we are specifically using LocalizeJS... otherwise the source string
  // for the legacy translations is already translated and won't match and
  // will potentially pollute our LocalizeJS dictionary upstream.
  const localizedTitle = localization.isLocalizeJS()
    ? localization.translate(msg[`${key}Title`](), ['poem', 'poem-title'])
    : msg[`${key}Title`]();
  const localizedLines = localization.isLocalizeJS()
    ? localization
        .translate(msg[`${key}Lines`]().replaceAll('\n', '<br/>'), [
          'poem',
          'poem-lines',
        ])
        .replaceAll(/\s*<br[/]?>\s*/g, '\n')
        .trim()
    : msg[`${key}Lines`]();

  return {
    key: key,
    locales: poemList[key].locales,
    author: poemList[key].author,
    title: poemList[key].title || localizedTitle,
    lines: poemList[key].linesSplit || localizedLines.split('\n'),
  };
}

export function getPoems() {
  switch (appOptions.level.standaloneAppName) {
    case PoetryStandaloneApp.PoetryHoc:
      return POEMS;
    case PoetryStandaloneApp.TimeCapsule:
      return TIME_CAPSULE_POEMS;
    default:
      return {};
  }
}

export function getPoemsFromListOrDefault(poemList) {
  const fullPoemList = getPoems();
  if (!poemList || poemList.length === 0) {
    return fullPoemList;
  }
  const result = {};
  poemList.forEach(poem => {
    if (fullPoemList[poem]) {
      result[poem] = fullPoemList[poem];
    }
  });
  return result;
}

// Don't alphabetize time capsule poems, they should remain in their
// original order.
export function shouldAlphabetizePoems() {
  return appOptions.level.standaloneAppName !== PoetryStandaloneApp.TimeCapsule;
}
