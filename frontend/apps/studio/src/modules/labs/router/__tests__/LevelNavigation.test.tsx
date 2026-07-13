import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import LevelNavigation from '../LevelNavigation';

describe('LevelNavigation', () => {
  const levels = [
    {position: 1, path: '/courses/oceans/units/1/lessons/1/levels/1'},
    {position: 2, path: '/courses/oceans/units/1/lessons/1/levels/2'},
    {position: 3, path: '/courses/oceans/units/1/lessons/1/levels/3'},
  ];

  it('shows "Level x of y" indicator', () => {
    render(<LevelNavigation currentPosition={2} levels={levels} />);

    expect(screen.getByText('Level 2 of 3')).toBeInTheDocument();
  });

  it('renders prev and next links', () => {
    render(<LevelNavigation currentPosition={2} levels={levels} />);

    const prev = screen.getByRole('link', {name: /previous level/i});
    const next = screen.getByRole('link', {name: /next level/i});

    expect(prev).toHaveAttribute('href', expect.stringContaining('/levels/1'));
    expect(next).toHaveAttribute('href', expect.stringContaining('/levels/3'));
  });

  it('disables prev at the first level', () => {
    render(<LevelNavigation currentPosition={1} levels={levels} />);

    expect(
      screen.queryByRole('link', {name: /previous level/i}),
    ).not.toBeInTheDocument();
  });

  it('disables next at the last level', () => {
    render(<LevelNavigation currentPosition={3} levels={levels} />);

    expect(
      screen.queryByRole('link', {name: /next level/i}),
    ).not.toBeInTheDocument();
  });

  it('has accessible navigation landmark', () => {
    render(<LevelNavigation currentPosition={2} levels={levels} />);

    expect(
      screen.getByRole('navigation', {name: /level/i}),
    ).toBeInTheDocument();
  });

  it('marks the level indicator as a polite live region', () => {
    render(<LevelNavigation currentPosition={2} levels={levels} />);

    const indicator = screen.getByText(/Level 2 of 3/);
    expect(indicator.closest('[aria-live]')).toHaveAttribute(
      'aria-live',
      'polite',
    );
    expect(indicator.closest('[aria-atomic]')).toHaveAttribute(
      'aria-atomic',
      'true',
    );
  });
});
