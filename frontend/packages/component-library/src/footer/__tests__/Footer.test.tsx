import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {Footer} from '../Footer';
import type {FooterLanguageOption, FooterSiteLink} from '../types';

const SITE_LINKS: FooterSiteLink[] = [
  {id: 'privacy', label: 'Privacy Policy', href: '/privacy'},
  {id: 'tos', label: 'Terms', href: '/tos'},
  {
    id: 'support',
    label: 'Help',
    href: 'https://support.code.org',
    external: true,
  },
  {id: 'store', label: 'Store', href: 'https://store.code.org', external: true},
];

const LANGUAGES: FooterLanguageOption[] = [
  {value: 'en', text: 'English'},
  {value: 'es', text: 'Español'},
  {value: 'fr', text: 'Français'},
];

function setup(overrides = {}) {
  return render(
    <Footer
      siteLinks={SITE_LINKS}
      copyright={<span>© Code.org 2025</span>}
      languages={LANGUAGES}
      selectedLocaleCode="en"
      onLanguageChange={() => {}}
      {...overrides}
    />,
  );
}

describe('Footer — site links', () => {
  it('renders every siteLinks entry as an anchor with the configured label and href', () => {
    setup();
    for (const link of SITE_LINKS) {
      const anchor = screen.getByRole('link', {name: link.label});
      expect(anchor).toBeInTheDocument();
      expect(anchor).toHaveAttribute('href', link.href);
    }
  });

  it('entry with external:true has rel="noopener noreferrer" and target="_blank"', () => {
    setup();
    const anchor = screen.getByRole('link', {name: 'Help'});
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('entry without external has neither rel nor target', () => {
    setup();
    const anchor = screen.getByRole('link', {name: 'Privacy Policy'});
    expect(anchor).not.toHaveAttribute('rel');
    expect(anchor).not.toHaveAttribute('target');
  });

  it('all external:true anchors share identical rel and target values', () => {
    setup();
    const externalLinks = SITE_LINKS.filter(l => l.external);
    for (const link of externalLinks) {
      const anchor = screen.getByRole('link', {name: link.label});
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
      expect(anchor).toHaveAttribute('target', '_blank');
    }
  });
});

describe('Footer — language picker', () => {
  it('renders all language options with the selectedLocaleCode selected', () => {
    setup({selectedLocaleCode: 'es'});
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('es');
    for (const lang of LANGUAGES) {
      expect(screen.getByRole('option', {name: lang.text})).toBeInTheDocument();
    }
  });

  it('calls onLanguageChange with the chosen value when a new option is picked', async () => {
    const onLanguageChange = jest.fn();
    setup({onLanguageChange});
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'fr');
    expect(onLanguageChange).toHaveBeenCalledWith('fr');
  });

  it('renders a skeleton and no select when languagesLoading is true', () => {
    setup({languagesLoading: true});
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});

describe('Footer — AWS image link', () => {
  const imageLink = {
    src: '/images/aws.webp',
    altText: 'Powered by AWS Cloud Computing',
    href: 'https://aws.amazon.com/what-is-cloud-computing',
    external: true,
  };

  it('image link has target="_blank", rel="noopener noreferrer", and non-empty alt', () => {
    setup({imageLink});
    const anchor = screen.getByRole('link', {name: /powered by aws/i});
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    const img = anchor.querySelector('img');
    expect(img?.alt).toBeTruthy();
  });
});
