import msg from '@cdo/poetry/locale';
import {POEMS} from './constants';

export function getPoem(key) {
  if (!key || !POEMS[key]) {
    return undefined;
  }
  return {
    key: key,
    author: POEMS[key].author,
    title: msg[`${key}Title`](),
    lines: msg[`${key}Lines`]().split('\n')
  };
}
