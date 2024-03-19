import msg from '@cdo/poetry/locale';

import {POEMS, PoetryStandaloneApp, TIME_CAPSULE_POEMS} from './constants';

export function getPoem(key) {
  const poemList = getPoems();
  if (!key || !poemList[key]) {
    return undefined;
  }
  return {
    key: key,
    locales: poemList[key].locales,
    author: poemList[key].author,
    title: poemList[key].title || msg[`${key}Title`](),
    lines: poemList[key].linesSplit || msg[`${key}Lines`]().split('\n'),
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
