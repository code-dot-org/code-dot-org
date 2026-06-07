import {render, within} from '@testing-library/react';
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
  return document.getElementById('help-menu-dropdown') as HTMLElement;
}

describe('HelpButton', () => {
  it('always offers Help and support + Report a problem', () => {
    const menu = renderAs('student');
    expect(within(menu).getByText('Help and support')).toBeInTheDocument();
    expect(within(menu).getByText('Report a problem')).toBeInTheDocument();
  });

  it('includes Teacher forum for teachers', () => {
    expect(
      within(renderAs('teacher')).getByText('Teacher forum'),
    ).toBeInTheDocument();
  });

  it('omits Teacher forum for students', () => {
    expect(
      within(renderAs('student')).queryByText('Teacher forum'),
    ).not.toBeInTheDocument();
  });
});
