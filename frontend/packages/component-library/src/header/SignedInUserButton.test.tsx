import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import Header from './Header';

const BASE = {
  logoImageUrl: '/logo.png',
  brandName: 'CodeAI',
  menuItems: [{label: 'Projects', href: '/projects'}],
};

function renderAs(user_type: 'student' | 'teacher') {
  render(
    <Header
      {...BASE}
      userAuth={{status: 'signed-in', display_name: 'Ms. Rivera', user_type}}
    />,
  );
  return document.getElementById('signed-in-user-dropdown') as HTMLElement;
}

describe('SignedInUserButton (account menu)', () => {
  it('shows the display name on the trigger', () => {
    renderAs('teacher');
    expect(screen.getByText('Ms. Rivera')).toBeInTheDocument();
  });

  it('shows the shared items but omits Pair programming for teachers', () => {
    const menu = renderAs('teacher');
    expect(within(menu).getByText('My projects')).toBeInTheDocument();
    expect(within(menu).getByText('Account settings')).toBeInTheDocument();
    expect(within(menu).getByText('Sign out')).toBeInTheDocument();
    expect(
      within(menu).queryByText('Pair programming'),
    ).not.toBeInTheDocument();
  });

  it('includes Pair programming for students', () => {
    const menu = renderAs('student');
    expect(within(menu).getByText('Pair programming')).toBeInTheDocument();
  });
});
