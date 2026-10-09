import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi} from 'vitest';

import SiteControls, {type PageZoom} from '../SiteControls';

function fakeZoom(level: number): PageZoom & {current: number} {
  const zoom = {
    current: level,
    levels: [50, 100, 200],
    level: () => zoom.current,
    setLevel: vi.fn((next: number) => {
      zoom.current = next;
    }),
  };
  return zoom;
}

describe('SiteControls', () => {
  it('steps through the zoom levels and stops at either end', async () => {
    const zoom = fakeZoom(100);
    render(<SiteControls zoom={zoom} />);
    await userEvent.click(screen.getByRole('button', {name: 'Zoom in (100%)'}));
    expect(zoom.setLevel).toHaveBeenLastCalledWith(200);
    expect(screen.getByRole('button', {name: 'Zoom in (200%)'})).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', {name: 'Zoom out (200%)'}),
    );
    await userEvent.click(
      screen.getByRole('button', {name: 'Zoom out (100%)'}),
    );
    expect(zoom.setLevel).toHaveBeenLastCalledWith(50);
    expect(screen.getByRole('button', {name: 'Zoom out (50%)'})).toBeDisabled();
  });

  it('steps from the level the page has now', async () => {
    const zoom = fakeZoom(100);
    render(<SiteControls zoom={zoom} />);
    zoom.current = 200;
    await userEvent.click(
      screen.getByRole('button', {name: 'Zoom out (100%)'}),
    );
    expect(zoom.setLevel).toHaveBeenLastCalledWith(100);
  });
});
