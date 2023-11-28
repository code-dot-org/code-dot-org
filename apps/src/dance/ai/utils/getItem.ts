import {DanceAiModelItem} from '../types';

import inputLibraryJson from '@cdo/static/dance/ai/ai-inputs.json';

const itemsById: {[key: string]: DanceAiModelItem} =
  inputLibraryJson.items.reduce(
    (bucket, item) => ({...bucket, [item.id]: item}),
    {}
  );

export const getItem = (id: string): DanceAiModelItem => itemsById[id];
