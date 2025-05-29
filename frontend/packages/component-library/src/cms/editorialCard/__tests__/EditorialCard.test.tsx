import {render, screen, within} from '@testing-library/react';

import EditorialCard, {EditorialCardProps} from './../EditorialCard';

describe('CMS EditorialCard', () => {
  const heading = 'EditorialCard Heading';
  const text = 'EditorialCard Text';
  const media = {iconName: 'smile'};

  const renderCard = (props: Partial<EditorialCardProps> = {}) =>
    render(
      <EditorialCard
        aria-label={heading}
        {...{heading, text, media}}
        {...props}
      />,
    );

  const getCard = () => screen.getByLabelText(heading);

  it('renders card', () => {
    renderCard();
    const card = getCard();
    expect(card).toBeVisible();
  });

  it('renders card icon', () => {
    renderCard();
    const cardIcon = getCard().querySelector('i');
    expect(cardIcon).toBeVisible();
  });

  it('renders card image', () => {
    const image = {src: 'test.jpg'};

    renderCard({media: image});

    const cardImage = getCard().querySelector('img');
    expect(cardImage).toBeVisible();
    expect(cardImage).toHaveAttribute('src', image.src);
  });

  it('renders card heading', () => {
    renderCard();
    const card = getCard();
    expect(within(card).getByRole('heading', {name: heading})).toBeVisible();
  });

  it('renders card text', () => {
    renderCard();
    const card = getCard();
    expect(within(card).getByText(text)).toBeVisible();
  });

  it('renders card link list with provided internal link', () => {
    const internalLinkProps = {
      text: 'Internal Link',
      href: 'https://code.org/internal-link',
      external: false,
    };

    renderCard({link: internalLinkProps});

    const internalLink = screen.getByRole('link', {
      name: internalLinkProps.text,
    });
    expect(internalLink).toBeVisible();
    expect(internalLink).toHaveAttribute('href', internalLinkProps.href);
    expect(
      within(internalLink).queryByRole('img', {name: 'external link'}),
    ).not.toBeInTheDocument();
  });

  it('renders card link list with provided external link', () => {
    const externalLinkProps = {
      text: 'External Link',
      href: 'https://code.org/external-link',
      external: true,
    };

    renderCard({link: externalLinkProps});

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

    renderCard({className});
    const card = getCard();

    expect(card).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(card).toHaveStyle(classStyle);
  });
});
