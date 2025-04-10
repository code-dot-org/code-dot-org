import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import IconHighlight, {
  IconHighlightContentfulProps,
} from '@/components/iconHighlight/IconHighlight';

describe('IconHighlight component', () => {
  const heading = 'Icon Highlight Heading';
  const text = 'Icon Highlight Text';
  const iconName = 'message';

  const renderCardContainer = (
    props: Partial<IconHighlightContentfulProps> = {},
  ) => {
    render(
      <IconHighlight
        {...props}
        heading={heading}
        text={text}
        iconName={iconName}
      />,
    );
  };

  it('renders card', () => {
    renderCardContainer();
    expect(screen.getByRole('complementary')).toBeVisible();
  });

  it('renders card icon', () => {
    renderCardContainer();

    const cardIcon = screen.getByRole('complementary')?.firstElementChild;

    expect(cardIcon).toBeVisible();
    expect(cardIcon).toHaveRole('presentation');
  });

  it('renders card heading', () => {
    renderCardContainer();
    expect(screen.getByRole('heading', {name: heading})).toBeVisible();
  });

  it('renders card text', () => {
    renderCardContainer();
    expect(screen.getByText(text)).toBeVisible();
  });

  it('does not render card link list when no links provided', () => {
    renderCardContainer();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders card link list with provided link entry', () => {
    const linkEntry = {
      sys: {
        id: 'link',
      },
      fields: {
        label: 'Link',
        primaryTarget: 'https://code.org/link',
        ariaLabel: 'Link aria label',
        isThisAnExternalLink: false,
      },
    };

    renderCardContainer({linkEntry: linkEntry});

    const linkList = screen.getByRole('list');
    expect(linkList).toBeVisible();

    const internalLink = within(linkList).getByRole('link', {
      name: linkEntry.fields.ariaLabel,
    });
    expect(internalLink).toBeVisible();
    expect(internalLink).toHaveTextContent(linkEntry.fields.label);
    expect(internalLink).toHaveAttribute(
      'href',
      linkEntry.fields.primaryTarget,
    );
    expect(internalLink).not.toHaveAttribute('target');
    expect(
      within(internalLink).queryByRole('img', {name: 'external link'}),
    ).not.toBeInTheDocument();
  });

  it('renders card link list with only provided link entries', () => {
    const linkEntry = {
      sys: {
        id: 'link',
      },
      fields: {
        label: 'Link',
        primaryTarget: 'https://code.org/link',
        ariaLabel: 'Link aria label',
        isThisAnExternalLink: false,
      },
    };
    const internalLinkEntry = {
      sys: {
        id: 'internal-link',
      },
      fields: {
        label: 'Internal Link',
        primaryTarget: 'https://code.org/internal-link',
        ariaLabel: 'Internal Link aria label',
        isThisAnExternalLink: false,
      },
    };
    const externalLinkEntry = {
      sys: {
        id: 'external-link',
      },
      fields: {
        label: 'External Link',
        primaryTarget: 'https://code.org/external-link',
        ariaLabel: 'External Link aria label',
        isThisAnExternalLink: true,
      },
    };

    renderCardContainer({
      linkEntry: linkEntry,
      linkEntries: [internalLinkEntry, externalLinkEntry],
    });

    const linkList = screen.getByRole('list');
    expect(linkList).toBeVisible();

    const link = within(linkList).queryByRole('link', {
      name: linkEntry.fields.ariaLabel,
    });
    expect(link).not.toBeInTheDocument();

    const internalLink = within(linkList).getByRole('link', {
      name: internalLinkEntry.fields.ariaLabel,
    });
    expect(internalLink).toBeVisible();
    expect(internalLink).toHaveTextContent(internalLinkEntry.fields.label);
    expect(internalLink).toHaveAttribute(
      'href',
      internalLinkEntry.fields.primaryTarget,
    );
    expect(internalLink).not.toHaveAttribute('target');
    expect(
      within(internalLink).queryByRole('img', {name: 'external link'}),
    ).not.toBeInTheDocument();

    const externalLink = within(linkList).getByRole('link', {
      name: externalLinkEntry.fields.ariaLabel,
    });
    expect(externalLink).toBeVisible();
    expect(externalLink).toHaveTextContent(externalLinkEntry.fields.label);
    expect(externalLink).toHaveAttribute(
      'href',
      externalLinkEntry.fields.primaryTarget,
    );
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(
      within(externalLink).queryByRole('img', {name: 'external link'}),
    ).toBeInTheDocument();
  });
});
