import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import Footer, {FooterProps, SiteLink, SocialLink, ImageLink} from '../Footer';

describe('CMS Footer', () => {
  const title = 'Footer Title';
  const mockDate = new Date(1970, 1, 1);
  const copyright = 'Copyright %{year}';
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

  const renderFooterContainer = (props: Partial<FooterProps> = {}) => {
    render(
      <Footer
        {...props}
        {...{title, copyright, siteLinks, socialLinks, imageLinks}}
      />,
    );
  };

  const getFooter = () => screen.getByTitle(title);

  beforeAll(() => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders footer', () => {
    renderFooterContainer();
    const footer = getFooter();
    expect(footer).toBeVisible();
  });

  it('renders footer copyright notices with current year', () => {
    renderFooterContainer();
    const copyrightNotices = screen.getByText(
      `Copyright ${mockDate.getFullYear()}`,
    );
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
});
