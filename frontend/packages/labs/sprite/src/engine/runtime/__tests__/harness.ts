import {makeImage, makeInstance} from '../../../sprites/__tests__/harness';
import type {Animation} from '../../../sprites/animation';
import type {SpriteP5} from '../../../sprites/types';
import {commands as spriteCommands} from '../commands/spriteCommands';
import CoreLibrary from '../CoreLibrary';
import type {RuntimeHost} from '../RuntimeHost';
import type {SpriteArg} from '../types';

/** A library over a fresh attached instance, as apps' TestableP5Wrapper gave. */
export async function makeLibrary(host?: RuntimeHost): Promise<CoreLibrary> {
  const p = await makeInstance();
  return new CoreLibrary(p, undefined, host);
}

/** One 50x50 frame cut from a 100x100 image, as apps' tests built it. */
export function makeAnimation(p: SpriteP5): Animation {
  const image = makeImage(p, 100, 100);
  const frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
  const sheet = new p.SpriteSheet(image, frames);
  return new p.Animation(sheet);
}

/** Registers `animation` under each of `names` in the predefined table. */
export function predefine(
  coreLibrary: CoreLibrary,
  names: string[],
  animation: Animation = makeAnimation(coreLibrary.p5),
): void {
  coreLibrary.p5.predefinedAnimations = Object.fromEntries(
    names.map(name => [name, animation]),
  );
}

export function getProp(
  coreLibrary: CoreLibrary,
  spriteArg: SpriteArg,
  prop: string,
): unknown {
  return spriteCommands.getProp.apply(coreLibrary, [spriteArg, prop]);
}
