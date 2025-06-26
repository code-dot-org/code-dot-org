import {render, screen, fireEvent} from '@testing-library/react';
import {useRouter, usePathname} from 'next/navigation';

import Footer from '../Footer';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('Footer', () => {
  const locale = 'en-US';

  const renderComponent = (props = {}) =>
    render(<Footer locale={locale} {...props} />);

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({push: jest.fn()});
    (usePathname as jest.Mock).mockReturnValue('/en-US/home');
  });

  it('opens OneTrust cookie dialog when "Manage Cookies" is clicked', () => {
    window.OneTrust = {ToggleInfoDisplay: jest.fn()};

    renderComponent();

    const manageCookiesLink = screen.getByText('Manage Cookies');
    const preventDefaultSpy = jest.fn();

    manageCookiesLink.addEventListener('click', e => {
      e.preventDefault = preventDefaultSpy;
    });
    fireEvent.click(manageCookiesLink);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(window.OneTrust.ToggleInfoDisplay).toHaveBeenCalled();
  });

  it('does not call ToggleInfoDisplay when OneTrust is not available', () => {
    window.OneTrust = undefined;

    renderComponent();

    const manageCookiesLink = screen.getByText('Manage Cookies');
    const preventDefaultSpy = jest.fn();

    manageCookiesLink.addEventListener('click', e => {
      e.preventDefault = preventDefaultSpy;
    });
    fireEvent.click(manageCookiesLink);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
