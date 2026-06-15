import {fireEvent, render, screen, within} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import UsersTabs, {type UsersTab} from '../UsersTabs';

const TABS: UsersTab[] = [
  {id: 'a', label: 'A'},
  {id: 'b', label: 'B', disabled: true},
  {id: 'c', label: 'C', disabled: true},
];

function setup(onTabChange = vi.fn()) {
  render(
    <UsersTabs tabs={TABS} activeTab="a" onTabChange={onTabChange}>
      panel content
    </UsersTabs>,
  );
  return within(screen.getByRole('tablist')).getAllByRole('tab');
}

describe('UsersTabs', () => {
  it('selects the active tab and disables placeholders', () => {
    const [a, b, c] = setup();
    expect(a).toHaveAttribute('aria-selected', 'true');
    expect(b).toBeDisabled();
    expect(c).toBeDisabled();
  });

  it('activates only enabled tabs on click', () => {
    const onTabChange = vi.fn();
    const [a, b] = setup(onTabChange);

    fireEvent.click(b);
    expect(onTabChange).not.toHaveBeenCalled();

    fireEvent.click(a);
    expect(onTabChange).toHaveBeenCalledWith('a');
  });

  it('associates the panel with the active tab', () => {
    setup();
    const panel = screen.getByRole('tabpanel');
    const activeTab = screen.getByRole('tab', {selected: true});
    expect(panel).toHaveAttribute('aria-labelledby', activeTab.id);
    expect(activeTab).toHaveAttribute('aria-controls', panel.id);
  });
});
