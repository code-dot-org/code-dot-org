import type p5 from 'p5';

import type {Camera} from './camera';
import type {Group} from './Group';
import type {InputState} from './input';
import type {SpriteP5} from './types';

/** The library's state for one attached instance (LIF-1). */
export interface SpriteContext {
  readonly p: SpriteP5;
  readonly allSprites: Group;
  readonly camera: Camera;
  readonly input: InputState;
  readonly startTime: number;
  readonly abort: AbortController;
}

const contexts = new WeakMap<object, SpriteContext>();

export function setContext(p: p5, context: SpriteContext): void {
  contexts.set(p, context);
}

export function findContext(p: p5): SpriteContext | undefined {
  return contexts.get(p);
}

export function getContext(p: p5): SpriteContext {
  const context = contexts.get(p);
  if (!context) {
    throw new Error('The sprite library is not attached to this p5 instance');
  }
  return context;
}
