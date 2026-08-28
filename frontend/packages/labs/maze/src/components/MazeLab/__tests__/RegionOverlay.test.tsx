// @vitest-environment jsdom
//
// This package's default vitest environment has no DOM (see editing.test.ts);
// RegionOverlay renders real DOM, so this file alone opts into jsdom.
//
// What's covered here, and what isn't: the browse-mode bug this guards
// against was Blockly's own injected SVG layers outranking the overlay in
// real-browser stacking order (explicit z-index escaping a non-stacking-
// context ancestor) — CSS stacking order isn't something jsdom computes, so
// that part of the fix has no unit test; it was verified against a live
// render (see the commit body). What jsdom CAN verify is the two pieces of
// the overlay's own contract that a stacking regression wouldn't touch: it's
// a real <button> (so any event delivered to it terminates there rather
// than reaching a sibling, by ordinary DOM ancestor-chain rules — no
// pointerdown-specific handler is needed for that), and the workspace-mode
// "yield" is wired through as an inline style, not left to rely on some
// other, easier-to-regress mechanism.
import '@testing-library/jest-dom/vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {RegionOverlay} from '../index';

// This package's vitest config has no `globals: true`, so
// @testing-library/react's usual auto-cleanup (which hooks a global
// `afterEach`) never registers — without this, each render() below leaks
// its <button> into the next test's document.
afterEach(cleanup);

describe('RegionOverlay', () => {
  it('renders a real <button>, not a role="button" div', () => {
    render(
      <RegionOverlay label="Edit toolbox" selected={false} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', {name: 'Edit toolbox'}).tagName).toBe(
      'BUTTON',
    );
  });

  it('fires onSelect from a full pointerdown→mousedown→pointerup→mouseup→click sequence, not from pointerdown alone', () => {
    const onSelect = vi.fn();
    render(
      <RegionOverlay label="Edit workspace" selected={false} onSelect={onSelect} />,
    );
    const button = screen.getByRole('button', {name: 'Edit workspace'});

    fireEvent.pointerDown(button);
    fireEvent.mouseDown(button);
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.pointerUp(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('applies the workspace-mode yield (pointerEvents: none) only when given', () => {
    const {rerender} = render(
      <RegionOverlay label="Edit workspace" selected={false} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole('button', {name: 'Edit workspace'})).not.toHaveStyle(
      {pointerEvents: 'none'},
    );

    rerender(
      <RegionOverlay
        label="Edit workspace"
        selected={false}
        onSelect={vi.fn()}
        style={{pointerEvents: 'none'}}
      />,
    );
    expect(screen.getByRole('button', {name: 'Edit workspace'})).toHaveStyle({
      pointerEvents: 'none',
    });
  });
});
