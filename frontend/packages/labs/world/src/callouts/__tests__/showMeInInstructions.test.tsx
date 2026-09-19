// A lesson's Show me links, through the REAL markdown renderer
// (specs/SHOW_ME_PLAN.md). What the other tests take on trust: that a name
// with a colon and a block's type survives the link parser and the
// sanitizer, and arrives at the handler as it was written.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {extensions, Markdown} from '@code-dot-org/markdown';

import {LESSONS} from '../../progression/lessons';
import {clickableNames, placeNamed} from '../places';

const rendered = (markdown: string, onActivate?: (id: string) => void) =>
  render(
    <Markdown
      content={markdown}
      extensions={[extensions.clickableText({onActivate})]}
    />,
  );

describe('a Show me link', () => {
  it('is a button that hands its name over as written', () => {
    const onActivate = vi.fn();
    rendered(LESSONS['motion/gravity'].instructions, onActivate);

    fireEvent.click(screen.getByText('Enhance Ground…'));
    expect(onActivate).toHaveBeenLastCalledWith('map.enhance:Ground');

    fireEvent.click(screen.getByText(/stops falling/));
    expect(onActivate).toHaveBeenLastCalledWith(
      'toolbox.block:world_on_Gravity_StopsFallingEvent',
    );
    // …and what it hands over is a place.
    for (const [name] of onActivate.mock.calls) {
      expect(placeNamed(name as string)).toBeDefined();
    }
  });

  it('can be pressed from the keyboard', () => {
    const onActivate = vi.fn();
    rendered(LESSONS['origin/first-world'].instructions, onActivate);
    const world = screen.getByText('World');
    world.focus();
    expect(document.activeElement).toBe(world);
    fireEvent.keyDown(world, {key: 'Enter'});
    expect(onActivate).toHaveBeenCalledWith('view.world');
  });

  it('is plain bold text where nothing listens, as in the progression dialog', () => {
    rendered(LESSONS['origin/first-world'].instructions);
    const world = screen.getByText('World');
    expect(world.tagName).toBe('B');
    expect(world).not.toHaveAttribute('tabindex');
  });

  it('renders every name the lesson’s markdown holds', () => {
    const onActivate = vi.fn();
    const lesson = LESSONS['input/arrows'].instructions;
    rendered(lesson, onActivate);
    // Each is a button in the reading order, and pressing them all hands
    // over the names in the order the markdown has them.
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => fireEvent.click(button));
    expect(onActivate.mock.calls.map(([name]) => name)).toEqual(
      clickableNames(lesson),
    );
  });
});
