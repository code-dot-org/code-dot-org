import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Footer, {FooterProps, SiteLink, SocialLink, ImageLink} from '../Footer';

describe('CMS Footer', () => {
  const title = 'Footer Title';
  const copyright = 'Copyright notices';
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
      label: 'Social Link Lable',
      href: '/social-link',
      icon: {iconName: 'facebook'},
    },
  ];
  const imageLinks: ImageLink[] = [
    {
      key: 'imageLink',
      label: 'Image Link Label',
      href: '/image-link',
      image: {
        src: 'https://code.org/shared/images/Powered-By_logo-horiz_RGB_REV.png',
      },
    },
  ];
  const languages = [
    {value: 'en', text: 'English'},
    {value: 'es', text: 'Spanish'},
  ];
  const mockLanguageChange = jest.fn();

  const renderFooterContainer = (props: Partial<FooterProps> = {}) => {
    render(
      <Footer
        {...props}
        {...{title, copyright, siteLinks, socialLinks, imageLinks}}
        onLanguageChange={mockLanguageChange}
        languages={languages}
      />,
    );
  };

  const getFooter = () => screen.getByTitle(title);

  it('renders footer', () => {
    renderFooterContainer();
    const footer = getFooter();
    expect(footer).toBeVisible();
  });

  it('renders footer copyright notices', () => {
    renderFooterContainer();
    const copyrightNotices = screen.getByText(copyright);
    expect(copyrightNotices).toBeVisible();
  });

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

  it('renders footer image links', () => {
    renderFooterContainer();

    const imageLink = screen.getByRole('link', {name: imageLinks[0].label});
    expect(imageLink).toBeVisible();
    expect(imageLink).toHaveAttribute('href', imageLinks[0].href);

    const imageLinkImg = within(imageLink).getByRole('img', {
      name: imageLinks[0].label,
    });
    expect(imageLinkImg).toBeVisible();
    expect(imageLinkImg).toHaveAttribute('src', imageLinks[0].image.src);
  });

  it('renders footer with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'color: red;';

    renderFooterContainer({className});
    const footer = getFooter();

    expect(footer).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(footer).toHaveStyle(classStyle);
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
