import {ExtendedBlock, GeneratorFunction} from '@cdo/apps/blockly/types';

import {
  BLOCK_TYPE as CREATE_ITEM,
  generator as createItemGenerator,
  register as registerCreateItem,
} from './createItem';
import decreaseScore from './decreaseScore';
import increaseScore from './increaseScore';
import {
  BLOCK_TYPE as REMOVE_ITEM,
  generator as removeItemGenerator,
  register as registerRemoveItem,
} from './removeItem';
import {
  BLOCK_TYPE as SET_BACKGROUND,
  generator as setBackgroundGenerator,
  register as registerSetBackground,
} from './setBackground';
import {
  BLOCK_TYPE as SET_ITEM_BEHAVIOR,
  generator as setItemBehaviorGenerator,
  register as registerSetItemBehavior,
} from './setItemBehavior';
import startScoring from './startScoring';
import {
  BLOCK_TYPE as WHEN_COLLIDE,
  extendedOptions as whenCollideExtended,
  generator as whenCollideGenerator,
  register as registerWhenCollide,
} from './whenCollide';
import whenStart from './whenStart';

interface DynamicBlockEntry {
  type: string;
  register: () => void;
  generator: GeneratorFunction;
  extendedOptions?: Partial<ExtendedBlock>;
}

interface JsonBlockEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  definition: Record<string, any>;
  generator: GeneratorFunction;
  extendedOptions?: Partial<ExtendedBlock>;
}

export const dynamicBlocks: DynamicBlockEntry[] = [
  {
    type: CREATE_ITEM,
    register: registerCreateItem,
    generator: createItemGenerator,
  },
  {
    type: SET_ITEM_BEHAVIOR,
    register: registerSetItemBehavior,
    generator: setItemBehaviorGenerator,
  },
  {
    type: SET_BACKGROUND,
    register: registerSetBackground,
    generator: setBackgroundGenerator,
  },
  {
    type: REMOVE_ITEM,
    register: registerRemoveItem,
    generator: removeItemGenerator,
  },
  {
    type: WHEN_COLLIDE,
    register: registerWhenCollide,
    generator: whenCollideGenerator,
    extendedOptions: whenCollideExtended,
  },
];

export const jsonBlocks: JsonBlockEntry[] = [
  whenStart,
  startScoring,
  increaseScore,
  decreaseScore,
];
