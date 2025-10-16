import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import SimpleList, {
  SimpleListItemEntry,
  SimpleListContentfulProps,
} from '@/components/contentful/simpleList/SimpleList';

describe('SimpleList component', () => {
  let items: SimpleListItemEntry[] = [
    {sys: {id: 'item-a'}, fields: {shortText: 'Item A'}},
    {sys: {id: 'item-b'}, fields: {shortText: 'Item b'}},
  ];

  const renderListContainer = (
    props: Partial<SimpleListContentfulProps> = {items},
  ) => {
    render(<SimpleList {...props} />);
  };

  it('renders list', () => {
    renderListContainer();
    expect(screen.getByRole('list')).toBeVisible();
  });

  it('renders list items', () => {
    renderListContainer();

    items.forEach(({fields: {shortText}}) => {
      expect(screen.getByText(shortText)).toBeVisible();
    });
  });

  describe('when no items provided', () => {
    beforeEach(() => {
      items = [];
    });

    it('renders empty list placeholder', () => {
      renderListContainer();

      const placeholder = screen.getByText(
        (_, node) =>
          node?.tagName === 'EM' &&
          !!node?.textContent?.includes('Simple List placeholder'),
      );

      expect(placeholder).toBeVisible();
    });
  });
});
