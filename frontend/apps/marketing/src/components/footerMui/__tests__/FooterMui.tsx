import XIcon from '@mui/icons-material/X';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Footer, {FooterProps, SiteLink, SocialLink} from '../FooterMui';

describe('FooterMui', () => {
  const siteLinks: SiteLink[] = [
    {
      key: 'siteLink',
      label: 'Site Link Label',
      href: '/site-link',
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
  const copyright = 'Copyright notices';
  const languages = [
    {value: 'en', text: 'English'},
    {value: 'es', text: 'Spanish'},
  ];
  const mockLanguageChange = jest.fn();

  const renderFooterContainer = (props: Partial<FooterProps> = {}) => {
    render(
      <Footer
        {...props}
        {...{siteLinks, socialLinks, copyright}}
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
    const copyrightNotices = screen.getByText(copyright);
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
});
