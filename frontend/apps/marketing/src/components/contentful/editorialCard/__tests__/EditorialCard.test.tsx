import {render, screen, within} from '@testing-library/react';

import EditorialCard, {
  EditorialCardContentfulProps,
  EDITORIAL_CARD_CONTENTFUL_LAYOUTS,
} from '@/components/contentful/editorialCard/EditorialCard';

describe('EditorialCard component', () => {
  const layoutOpt = EDITORIAL_CARD_CONTENTFUL_LAYOUTS.HORIZONTAL_WITH_IMAGE;
  const heading = 'Icon Highlight Heading';
  const text = 'Icon Highlight Text';
  const iconName = 'smile';
  const image =
    'https://contentful-images.code.org/90t6bu6vlf76/1SptVYIyW5meSA34NcP99o/499a67854db82f98ee7717dbc9b95c6e/component_editorial_card_thumbnail.png';
  const linkEntry = {
    fields: {
      label: 'Link',
      primaryTarget: 'https://code.org/link',
      ariaLabel: 'Link aria label',
      isThisAnExternalLink: true,
    },
  };

  const renderCard = (props: Partial<EditorialCardContentfulProps> = {}) =>
    render(
      <EditorialCard
        layoutOpt={layoutOpt}
        heading={heading}
        text={text}
        iconName={iconName}
        image={image}
        linkEntry={linkEntry}
        {...props}
      />,
    );

  it('renders card in "horizontal_with_image" layout with image', () => {
    renderCard();

    const img = document.querySelector('img');

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', image + '?fm=avif');
  });

  it('renders card in "vertical_with_image" layout with image', () => {
    renderCard({
      layoutOpt: EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_IMAGE,
    });

    const img = document.querySelector('img');

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', image + '?fm=avif');
  });

  it('renders card in "vertical_with_icon" layout with icon', () => {
    renderCard({
      layoutOpt: EDITORIAL_CARD_CONTENTFUL_LAYOUTS.VERTICAL_WITH_ICON,
    });
    expect(document.querySelector('i')).toBeInTheDocument();
  });

  it('renders card heading', () => {
    renderCard();
    expect(screen.getByRole('heading', {name: heading})).toBeVisible();
  });

  it('renders card text', () => {
    renderCard();
    expect(screen.getByText(text)).toBeVisible();
  });

  it('renders card link', () => {
    renderCard();

    const externalLink = screen.getByRole('link', {
      name: linkEntry.fields.ariaLabel,
    });

    expect(externalLink).toBeVisible();
    expect(externalLink).toHaveTextContent(linkEntry.fields.label);
    expect(externalLink).toHaveAttribute(
      'href',
      linkEntry.fields.primaryTarget,
    );
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      within(externalLink).getByTestId('font-awesome-v6-icon'),
    ).toBeInTheDocument();
  });

  it('renders empty card placeholder when no media provided', () => {
    renderCard({iconName: undefined, image: undefined});

    const placeholder = screen.getByText(
      (_, node) =>
        node?.tagName === 'EM' &&
        !!node?.textContent?.includes('Editorial Card placeholder'),
    );

    expect(placeholder).toBeVisible();
  });
});
