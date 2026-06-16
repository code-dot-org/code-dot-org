import {render, screen, within, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import CreateMenu from '../CreateMenu';

const ITEMS = [
  {
    id: 'spritelab',
    label: 'Sprite Lab',
    href: '/projects/spritelab/new',
    iconUrl: '/sprite.png',
  },
  {
    id: 'applab',
    label: 'App Lab',
    href: '/projects/applab/new',
    iconUrl: '/applab.png',
  },
];

function renderMenu() {
  render(<CreateMenu items={ITEMS} />);
  return screen.getByRole('button', {name: 'New project menu'});
}

describe('CreateMenu', () => {
  it('opens the project picker on click', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = await screen.findByRole('menu');
    expect(
      within(menu).getByRole('menuitem', {name: 'Sprite Lab'}),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', {name: 'App Lab'}),
    ).toHaveAttribute('href', '/projects/applab/new');
  });

  it('advertises a popup and wires aria-controls to the menu only when open', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);
    await screen.findByRole('menu');

    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
    expect(document.getElementById(controls!)).not.toBeNull();
  });

  it('moves focus to the next item on ArrowDown (MenuList roving tabindex)', async () => {
    const user = userEvent.setup();
    await user.click(renderMenu());
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    expect(items[0]).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(items[1]).toHaveFocus();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    await user.click(trigger);
    await screen.findByRole('menu');

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });
});
