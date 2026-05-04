import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Footer from '../Footer';
import type {FooterProps} from '../Footer';

const BASE_PROPS: FooterProps = {
  siteLinks: [
    {id: 'a', label: 'Link A', href: '/a'},
    {id: 'b', label: 'Link B', href: '/b', external: true},
    {id: 'c', label: 'Link C', href: '/c', external: true},
  ],
  copyright: 'Copyright text',
  fineprint: 'Fine print',
  imageLink: {
    src: '/img.png',
    altText: 'Logo alt',
    href: '/img-dest',
    external: true,
  },
  languages: [
    {value: 'en', text: 'English'},
    {value: 'es', text: 'Español'},
  ],
  selectedLocaleCode: 'en',
  languagesReady: true,
  onLanguageChange: jest.fn(),
};

describe('Footer', () => {
  it('renders every siteLink with its label and href', () => {
    render(<Footer {...BASE_PROPS} />);
    for (const link of BASE_PROPS.siteLinks) {
      const anchor = screen.getByRole('link', {
        name: link.label,
      }) as HTMLAnchorElement;
      expect(anchor).toBeInTheDocument();
      expect(anchor.getAttribute('href')).toBe(link.href);
    }
  });

  it('renders an external link with rel and target', () => {
    render(<Footer {...BASE_PROPS} />);
    const anchor = screen.getByRole('link', {
      name: 'Link B',
    }) as HTMLAnchorElement;
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('renders a non-external link without rel or target', () => {
    render(<Footer {...BASE_PROPS} />);
    const anchor = screen.getByRole('link', {
      name: 'Link A',
    }) as HTMLAnchorElement;
    expect(anchor).not.toHaveAttribute('rel');
    expect(anchor).not.toHaveAttribute('target');
  });

  it('all external links share identical rel and target values', () => {
    render(<Footer {...BASE_PROPS} />);
    const externalLinks = BASE_PROPS.siteLinks.filter(l => l.external);
    for (const link of externalLinks) {
      const anchor = screen.getByRole('link', {
        name: link.label,
      }) as HTMLAnchorElement;
      expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
      expect(anchor.getAttribute('target')).toBe('_blank');
    }
  });

  it('renders a skeleton and no select when languagesReady is false', () => {
    render(<Footer {...BASE_PROPS} languagesReady={false} languages={[]} />);
    expect(screen.queryByRole('combobox')).toBeNull();
    // MUI Skeleton renders as a span with role="presentation" by default
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('renders all language options with the selected locale active', () => {
    render(<Footer {...BASE_PROPS} selectedLocaleCode="es" />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('es');
    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(BASE_PROPS.languages.length);
    expect(options.map(o => (o as HTMLOptionElement).value)).toEqual(
      BASE_PROPS.languages.map(l => l.value),
    );
  });

  it('calls onLanguageChange with the chosen value', async () => {
    const onLanguageChange = jest.fn();
    const user = userEvent.setup();
    render(<Footer {...BASE_PROPS} onLanguageChange={onLanguageChange} />);
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'es');
    expect(onLanguageChange).toHaveBeenCalledWith('es');
  });

  it('AWS image link has target, rel, and a non-empty alt', () => {
    render(<Footer {...BASE_PROPS} />);
    const img = screen.getByAltText('Logo alt') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    const anchor = img.closest('a') as HTMLAnchorElement;
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    expect(img.alt).not.toBe('');
  });

  it('accent link wrapper carries data-accent attribute', () => {
    render(
      <Footer
        {...BASE_PROPS}
        siteLinks={[
          {id: 'x', label: 'Accent Link', href: '/x', accent: true},
          {id: 'y', label: 'Plain Link', href: '/y'},
        ]}
      />,
    );
    const accentAnchor = screen.getByRole('link', {name: 'Accent Link'});
    expect(accentAnchor.closest('[data-accent]')).not.toBeNull();

    const plainAnchor = screen.getByRole('link', {name: 'Plain Link'});
    expect(plainAnchor.closest('[data-accent]')).toBeNull();
  });

  it('renders copyright content', () => {
    render(<Footer {...BASE_PROPS} copyright="© Test Org, 2026" />);
    expect(screen.getByText('© Test Org, 2026')).toBeInTheDocument();
  });

  it('omits fineprint element when fineprint prop is absent', () => {
    const {container} = render(
      <Footer {...BASE_PROPS} fineprint={undefined} />,
    );
    expect(container.querySelector('.MuiFooter-fineprint')).toBeNull();
  });

  it('omits AWS image when imageLink prop is absent', () => {
    render(<Footer {...BASE_PROPS} imageLink={undefined} />);
    expect(screen.queryByAltText('Logo alt')).toBeNull();
  });
});
