import {render, screen, within, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SignedInUserButton from '../components/SignedInUserButton';

function renderAs(user_type: 'student' | 'teacher') {
  render(
    <SignedInUserButton
      userAuth={{status: 'signed-in', display_name: 'Ms. Rivera', user_type}}
    />,
  );
  return screen.getByRole('button', {name: 'Account menu'});
}

describe('SignedInUserButton (account menu)', () => {
  it('shows the display name on the trigger', () => {
    expect(renderAs('teacher')).toHaveTextContent('Ms. Rivera');
  });

  it('opens the account menu with shared items, omitting Pair programming for teachers', async () => {
    const user = userEvent.setup();
    const trigger = renderAs('teacher');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = await screen.findByRole('menu');
    expect(
      within(menu).getByRole('menuitem', {name: 'My projects'}),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', {name: 'Account settings'}),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', {name: 'Sign out'}),
    ).toBeInTheDocument();
    expect(
      within(menu).queryByRole('menuitem', {name: 'Pair programming'}),
    ).not.toBeInTheDocument();
  });

  it('advertises a popup and wires aria-controls to the menu only when open', async () => {
    const user = userEvent.setup();
    const trigger = renderAs('teacher');
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
    await user.click(renderAs('teacher'));
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    expect(items[0]).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    expect(items[1]).toHaveFocus();
  });

  it('includes Pair programming for students', async () => {
    const user = userEvent.setup();
    await user.click(renderAs('student'));
    expect(
      await screen.findByRole('menuitem', {name: 'Pair programming'}),
    ).toBeInTheDocument();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    const trigger = renderAs('teacher');
    await user.click(trigger);
    await screen.findByRole('menu');

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });
});
