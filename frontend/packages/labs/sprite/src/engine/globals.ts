// What a Sprite Lab program sees besides the commands: p5's drawing, math
// and color functions and its constants, the sprite library's input
// queries, and the global functions apps' droplet config gave every
// interpreted lab. No block reaches a sprite or group except through the
// commands, so the library's objects are not exposed.
import p5 from 'p5';

import type {SpriteP5} from '../sprites';

import type {ProgramRunner} from './interpreter/ProgramRunner';

export const P5_FUNCTIONS = [
  // math
  'abs',
  'acos',
  'asin',
  'atan',
  'atan2',
  'ceil',
  'constrain',
  'cos',
  'createVector',
  'degrees',
  'dist',
  'exp',
  'floor',
  'lerp',
  'log',
  'mag',
  'map',
  'max',
  'min',
  'noise',
  'norm',
  'pow',
  'radians',
  'random',
  'randomGaussian',
  'round',
  'sin',
  'sq',
  'sqrt',
  'tan',
  // color
  'alpha',
  'blue',
  'brightness',
  'color',
  'green',
  'hue',
  'lerpColor',
  'red',
  'saturation',
  // drawing
  'angleMode',
  'arc',
  'background',
  'beginShape',
  'circle',
  'colorMode',
  'ellipse',
  'ellipseMode',
  'endShape',
  'fill',
  'image',
  'imageMode',
  'line',
  'noFill',
  'noStroke',
  'noTint',
  'point',
  'pop',
  'push',
  'quad',
  'rect',
  'rectMode',
  'rotate',
  'scale',
  'square',
  'stroke',
  'strokeWeight',
  'text',
  'textAlign',
  'textFont',
  'textSize',
  'textWidth',
  'tint',
  'translate',
  'triangle',
  'vertex',
  // time
  'day',
  'hour',
  'millis',
  'minute',
  'month',
  'second',
  'year',
  // the sprite library's input queries
  'keyDown',
  'keyWentDown',
  'keyWentUp',
  'mouseDown',
  'mouseUp',
  'mouseWentDown',
  'mouseWentUp',
  'mouseIsOver',
  'mousePressedOver',
] as const;

/** Apps' `dropletUtilsGlobalFunctions`, minus the one that blocks on a prompt. */
const DROPLET_GLOBALS = {
  randomNumber(min: number, max?: number): number {
    if (typeof max === 'undefined') {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (~~max - ~~min + 1)) + ~~min;
  },
  getTime(): number {
    return new Date().getTime();
  },
};

/** The names of p5's constants: upper-case strings and numbers. */
export function p5ConstantNames(p: SpriteP5): string[] {
  const instance = p as unknown as Record<string, unknown>;
  const names = new Set<string>();
  for (
    let proto: object | null = p;
    proto && proto !== Object.prototype;
    proto = Object.getPrototypeOf(proto)
  ) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (
        /^[A-Z][A-Z0-9_]*$/.test(name) &&
        ['string', 'number'].includes(typeof instance[name])
      ) {
        names.add(name);
      }
    }
  }
  return [...names].sort();
}

/** Defines p5's and droplet's globals in the program. */
export function defineGlobals(runner: ProgramRunner, p: SpriteP5): void {
  const instance = p as unknown as Record<string, unknown>;
  for (const name of P5_FUNCTIONS) {
    runner.createGlobalProperty(name, instance[name], p);
  }
  for (const name of p5ConstantNames(p)) {
    runner.createGlobalProperty(name, instance[name]);
  }
  for (const [name, fn] of Object.entries(DROPLET_GLOBALS)) {
    runner.createGlobalProperty(name, fn, DROPLET_GLOBALS);
  }
}

/** Native classes whose instances a program uses as they are. */
export const CUSTOM_MARSHAL_OBJECTS = [
  {instance: p5.Color},
  {instance: p5.Vector},
  {instance: p5.Image},
];
