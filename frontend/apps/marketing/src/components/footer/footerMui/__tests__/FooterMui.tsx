import XIcon from '@mui/icons-material/X';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {Brand} from '@/config/brand';

import Footer, {FooterProps, SiteLink, SocialLink} from '../FooterMui';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('FooterMui', () => {
  const siteLinks: SiteLink[] = [
    {
      key: 'siteLink',
      label: 'Site Link Label',
      href: '/site-link',
    },
    {
      key: 'manage-cookies',
      label: 'Manage Cookies',
      href: '/cookies',
      onClick: (e: {preventDefault: () => void}) => {
        if (window?.OneTrust) {
          e.preventDefault();
          // Displays the OneTrust cookie dialog
          window.OneTrust.ToggleInfoDisplay();
        }
      },
    },
  ];
  const socialLinks: SocialLink[] = [
    {
      key: 'socialLink',
      label: 'Social Link Label',
      href: '/social-link',
      icon: <XIcon />,
    },
  ];
  const copyright = {
    value: 'Copyright notices',
    showIcon: false,
  };
  const languages = [
    {value: 'en', text: 'English'},
    {value: 'es', text: 'Spanish'},
  ];
  const mockLanguageChange = jest.fn();

  const renderFooterContainer = (props: Partial<FooterProps> = {}) => {
    render(
      <Footer
        {...{siteLinks, socialLinks, copyright, brand: Brand.CS_FOR_ALL}}
        {...props}
        onLanguageChange={mockLanguageChange}
        languages={languages}
      />,
    );
  };

  it('renders footer site links', () => {
    renderFooterContainer();
    const siteLink = screen.getByRole('link', {name: siteLinks[0].label});
    expect(siteLink).toBeVisible();
    expect(siteLink).toHaveAttribute('href', siteLinks[0].href);
  });

  it('renders footer social links', () => {
    renderFooterContainer();
    const socialLink = screen.getByRole('link', {name: socialLinks[0].label});
    expect(socialLink).toBeVisible();
    expect(socialLink).toHaveAttribute('href', socialLinks[0].href);
  });

  it('renders footer copyright notices', () => {
    renderFooterContainer();
    const copyrightNotices = screen.getByText(copyright.value);
    expect(copyrightNotices).toBeVisible();
  });

  it('renders footer with language selector', () => {
    renderFooterContainer();
    const languageSelect = screen.getByRole('combobox');

    expect(languageSelect).toBeVisible();
    userEvent.click(languageSelect);

    expect(languageSelect).toHaveTextContent('English');
    expect(languageSelect).toHaveTextContent('Spanish');
    // Don't translate the language dropdown - one of the parents must have the notranslate class
    expect(languageSelect.closest('.notranslate')).not.toBeNull();
  });

  it('calls onLanguageChange when language is changed', async () => {
    renderFooterContainer();
    const languageSelect = screen.getByRole('combobox');

    // Simulate changing the language
    await userEvent.selectOptions(languageSelect, 'es');
    expect(mockLanguageChange).toHaveBeenCalledWith('es');
  });

  it('opens OneTrust cookie dialog when "Manage Cookies" is clicked', () => {
    window.OneTrust = {
      ToggleInfoDisplay: jest.fn(),
      OnConsentChanged: jest.fn(),
      IsAlertBoxClosedAndValid: jest.fn(),
    };

    renderFooterContainer();

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

    renderFooterContainer();

    const manageCookiesLink = screen.getByText('Manage Cookies');
    const preventDefaultSpy = jest.fn();

    manageCookiesLink.addEventListener('click', e => {
      e.preventDefault = preventDefaultSpy;
    });
    fireEvent.click(manageCookiesLink);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
