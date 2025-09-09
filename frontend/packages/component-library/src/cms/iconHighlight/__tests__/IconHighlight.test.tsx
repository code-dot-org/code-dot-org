import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import IconHighlight, {IconHighlightProps} from '../IconHighlight';

describe('CMS IconHighlight', () => {
  const heading = 'IconHighlight Heading';
  const text = 'IconHighlight Text';
  const icon = {iconName: 'message'};

  const renderCardContainer = (props: Partial<IconHighlightProps> = {}) => {
    render(<IconHighlight {...props} {...{heading, text, icon}} />);
  };

  const getCard = () =>
    screen.getByRole('heading', {name: heading}).closest('div');

  it('renders card', () => {
    renderCardContainer();
    const card = getCard();
    expect(card).toBeVisible();
  });

  it('renders card icon', () => {
    renderCardContainer();

    const card = getCard();
    const cardIcon = card?.firstElementChild;

    expect(cardIcon).toBeVisible();
    expect(cardIcon).toHaveRole('presentation');
  });

  it('renders card heading', () => {
    renderCardContainer();
    expect(screen.getByText(heading)).toBeVisible();
  });

  it('renders card text', () => {
    renderCardContainer();
    expect(screen.getByText(text)).toBeVisible();
  });

  it('does not render card link list when no links provided', () => {
    renderCardContainer();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('renders card link list with provided links', () => {
    const internalLinkProps = {
      key: 'internal-link',
      text: 'Link A',
      href: 'https://code.org/internal-link',
      external: false,
    };
    const externalLinkProps = {
      key: 'external-link',
      text: 'Link B',
      href: 'https://code.org/external-link',
      external: true,
    };

    renderCardContainer({links: [internalLinkProps, externalLinkProps]});
    renderCardContainer();

    const linkList = screen.queryByRole('list');
    expect(linkList).toBeVisible();

    const internalLink = screen.getByRole('link', {
      name: internalLinkProps.text,
    });
    expect(internalLink).toBeVisible();
    expect(internalLink).toHaveAttribute('href', internalLinkProps.href);
    expect(
      within(internalLink).queryByRole('img', {name: 'external link'}),
    ).not.toBeInTheDocument();

    const externalLink = screen.getByRole('link', {
      name: new RegExp(externalLinkProps.text, 'i'),
    });
    expect(externalLink).toBeVisible();
    expect(externalLink).toHaveAttribute('href', externalLinkProps.href);
    expect(
      within(externalLink).queryByRole('img', {name: 'external link'}),
    ).toBeInTheDocument();
  });

  it('renders card with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'color: red;';

    renderCardContainer({className});
    const card = getCard();

    expect(card).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(card).toHaveStyle(classStyle);
  });
});
