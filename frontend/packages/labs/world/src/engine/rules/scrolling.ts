// What makes an actor a window onto its own children (specs/ONE_WORLD_PLAN.md,
// "Clipping").
//
// An actor that `Scrolls Its Children` draws its children inside its box and
// nowhere else, moved up the page by `scroll`. A child's stored position is
// in the parent's frame as ever; the scroll is applied between the two
// (`parenting.childFrameOf`), so every rule that reads a child's position
// reads where it is drawn. The engine keeps `scroll` inside the content and
// writes `content` from the children each tick (`World.settleScrolling`).
//
// A FOUNDATION rule, as the Viewport and the box are: a Scroll View's `use
// trait` has to resolve whether or not a project names this rule.

import {RuleBuilder} from '../builders/RuleBuilder';
import type {Actor} from '../core/Actor';
import {registerChildOffset} from '../core/parenting';
import {Vector} from '../core/Vector';

export const SCROLLING = {
  rule: 'scrolling',
  trait: 'scrolls',
  scroll: 'scroll',
  content: 'content',
} as const;

const rule = new RuleBuilder({
  id: SCROLLING.rule,
  name: 'Scrolling',
  ability: 'Scrolls Its Children',
});

export const ScrollsTrait = rule.addTrait({
  id: SCROLLING.trait,
  name: 'Scrolls Its Children',
  description:
    'Shows its children inside its box, and moves them under it when scrolled.',
});

/**
 * How far the window has been scrolled down what it holds, in pixels.
 *
 * FROM THE TOP LEFT OF THE CONTENT TO THE TOP LEFT OF THE WINDOW, which is
 * what a scroll offset means everywhere else. Kept inside the content by the
 * engine, which writes back where it stopped, so a scrollbar drawn from it
 * cannot run off its track.
 */
export const ScrollProperty = ScrollsTrait.addProperty(
  SCROLLING.scroll,
  'vector',
  {x: 0, y: 0},
  {name: 'scroll'},
);

/**
 * How big what it holds is, in pixels: the window, or the children's extent
 * past its top left corner where that is bigger. Written by the engine.
 */
export const ContentProperty = ScrollsTrait.addProperty(
  SCROLLING.content,
  'vector',
  {x: 0, y: 0},
  {name: 'content', readonly: true},
);

export const ScrollingRule = rule.build();

registerChildOffset((parent: Actor) => {
  if (!parent.has(ScrollsTrait)) {
    return undefined;
  }
  const scroll = parent.get(ScrollProperty) as {x: number; y: number};
  return new Vector(-scroll.x, -scroll.y);
});
