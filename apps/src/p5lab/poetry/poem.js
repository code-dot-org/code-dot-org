/* global appOptions */
import msg from '@cdo/poetry/locale';
import {POEMS, PoetryStandaloneApp, TIME_CAPSULE_POEMS} from './constants';

export function getPoem(key) {
  const poemList = getPoems(appOptions.level.standaloneAppName);
  if (!key || !poemList[key]) {
    return undefined;
  }
  return {
    key: key,
    locales: poemList[key].locales,
    author: poemList[key].author,
    title: poemList[key].title || msg[`${key}Title`](),
    lines: poemList[key].linesSplit || msg[`${key}Lines`]().split('\n')
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
