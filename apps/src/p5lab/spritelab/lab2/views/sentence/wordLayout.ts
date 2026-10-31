import {queryParams} from '@cdo/apps/code-studio/utils';

/**
 * How the word menus lay their words out: every slot's words in clusters
 * down the pane, or one slot at a time in a carousel that moves sideways
 * or up and down. `?words=` picks one; clusters is the default.
 */
export type WordLayout = 'clusters' | 'carousel' | 'vcarousel';

type ParamReader = (name: string) => unknown;

export function readWordLayout(param: ParamReader = queryParams): WordLayout {
  const value = param('words');
  return value === 'carousel' || value === 'vcarousel' ? value : 'clusters';
}
