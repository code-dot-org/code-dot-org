import {EmojiItem} from '../types';

import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';

const itemsById: {[key: string]: EmojiItem} = inputLibraryJson.items.reduce(
  (bucket, item) => ({...bucket, [item.id]: item}),
  {}
);

// given an item id, returns the item object
export const getEmojiItem = (id: string): EmojiItem => itemsById[id];
