import {render, screen, within, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import HelpButton from './HelpButton';

function renderAs(userType: 'student' | 'teacher') {
  render(<HelpButton userType={userType} />);
  return screen.getByRole('button', {name: 'Help menu'});
}

describe('HelpButton', () => {
  it('opens the support menu on click', async () => {
    const user = userEvent.setup();
    const trigger = renderAs('student');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = await screen.findByRole('menu');
    expect(
      within(menu).getByRole('menuitem', {name: 'Help and support'}),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole('menuitem', {name: 'Report a problem'}),
    ).toBeInTheDocument();
  });

  it('includes Teacher forum for teachers', async () => {
    const user = userEvent.setup();
    await user.click(renderAs('teacher'));
    expect(
      await screen.findByRole('menuitem', {name: 'Teacher forum'}),
    ).toBeInTheDocument();
  });

  it('omits Teacher forum for students', async () => {
    const user = userEvent.setup();
    await user.click(renderAs('student'));
    await screen.findByRole('menu');
    expect(
      screen.queryByRole('menuitem', {name: 'Teacher forum'}),
    ).not.toBeInTheDocument();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    const trigger = renderAs('student');
    await user.click(trigger);
    await screen.findByRole('menu');

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it('opens external support links in a new tab', async () => {
    const user = userEvent.setup();
    await user.click(renderAs('student'));
    const item = await screen.findByRole('menuitem', {
      name: 'Help and support',
    });
    expect(item).toHaveAttribute('target', '_blank');
    expect(item.getAttribute('rel')).toContain('noopener');
  });
});
