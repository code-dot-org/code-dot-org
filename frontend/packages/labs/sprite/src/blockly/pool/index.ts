import {type ConvertedPool, convertPool} from './convert';
import type {PoolBlock} from './types';

export {convertPool, convertPoolBlock, poolBlockType} from './convert';
export type {ConvertedPool} from './convert';
export {setLocationPicker} from './locationField';
export type {LocationPicker, PickedLocation} from './locationField';
export type {PoolArg, PoolBlock, PoolBlockConfig} from './types';

const converted = new WeakMap<readonly PoolBlock[], ConvertedPool>();
const EMPTY: readonly PoolBlock[] = [];

/**
 * A level's pool, converted once per `sharedBlocks` array and reported
 * once: the lab's App and view both ask for it.
 */
export function levelPool(
  sharedBlocks: readonly PoolBlock[] | undefined,
): ConvertedPool {
  const pool = sharedBlocks ?? EMPTY;
  let result = converted.get(pool);
  if (!result) {
    result = convertPool(pool);
    for (const {name, error} of result.errors) {
      console.error(`Block pool: ${name} not converted: ${error.message}`);
    }
    converted.set(pool, result);
  }
  return result;
}
