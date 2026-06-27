import type {Mixin} from '../types';

export function defineMixin<T extends object>(
  name: string,
  mixin: T,
): Mixin<T> {
  return {name, mixin} as Mixin<T>;
}
