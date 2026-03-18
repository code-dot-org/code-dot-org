import {
  BlockJson,
  ExtendedBlock,
  GeneratorFunction,
} from '@cdo/apps/blockly/types';

import {
  BLOCK_TYPE as CREATE_ITEM,
  generator as createItemGenerator,
  register as registerCreateItem,
} from './createItem';
import {
  BLOCK_TYPE as SET_ITEM_BEHAVIOR,
  generator as setItemBehaviorGenerator,
  register as registerSetItemBehavior,
} from './setItemBehavior';
import whenStart from './whenStart';

interface DynamicBlockEntry {
  type: string;
  register: () => void;
  generator: GeneratorFunction;
}

interface JsonBlockEntry {
  definition: BlockJson;
  generator: GeneratorFunction;
  extendedOptions?: Partial<ExtendedBlock>;
}

export const dynamicBlocks: DynamicBlockEntry[] = [
  {type: CREATE_ITEM, register: registerCreateItem, generator: createItemGenerator},
  {type: SET_ITEM_BEHAVIOR, register: registerSetItemBehavior, generator: setItemBehaviorGenerator},
];

export const jsonBlocks: JsonBlockEntry[] = [whenStart];
