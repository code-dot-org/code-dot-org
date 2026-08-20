import {render, screen} from '@testing-library/react';
import React from 'react';

import ProgressRing from '@cdo/apps/aiLessons/ProgressRing';

describe('ProgressRing', () => {
  it('exposes progress via the progressbar role', () => {
    render(<ProgressRing done={2} total={5} size={96} />);
    const ring = screen.getByRole('progressbar', {
      name: '2 of 5 steps complete',
    });
    expect(ring.getAttribute('aria-valuenow')).toBe('2');
    expect(ring.getAttribute('aria-valuemax')).toBe('5');
  });

  it('handles a single-step path', () => {
    render(<ProgressRing done={1} total={1} size={40} />);
    expect(
      screen.getByRole('progressbar', {name: '1 of 1 steps complete'})
    ).toBeTruthy();
  });

  it('renders the center content', () => {
    render(<ProgressRing done={0} total={3} size={96} center="0/3" />);
    expect(screen.getByText('0/3')).toBeTruthy();
  });
});
