import msg from '@cdo/poetry/locale';
import {POEMS} from './constants';

export function getPoem(key) {
  if (!key || !POEMS[key]) {
    return undefined;
  }
  return {
    key: key,
    locales: POEMS[key].locales,
    author: POEMS[key].author,
    title: POEMS[key].title || msg[`${key}Title`](),
    lines: POEMS[key].linesSplit || msg[`${key}Lines`]().split('\n')
  };
}
