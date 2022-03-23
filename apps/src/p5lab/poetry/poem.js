import msg from '@cdo/poetry/locale';
import {POEMS} from './constants';

export function getPoem(key) {
  if (!key || !POEMS[key]) {
    return undefined;
  }
  return {
    key: key,
    locale: POEMS[key].locale,
    author: POEMS[key].author,
    title: POEMS[key].title || msg[`${key}Title`](),
    lines: POEMS[key].linesSplit || msg[`${key}Lines`]().split('\n')
  };
}
