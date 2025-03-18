import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import ExpandedList, {ExpandedListProps} from '../ExpandedList';

describe('Design System - ExpandedList', () => {
  const items = [
    {key: 'item-a', label: 'Item A', content: 'Content A'},
    {key: 'item-b', label: 'Item B', content: 'Content B'},
  ];

  const renderListContainer = (props: Partial<ExpandedListProps> = {}) => {
    render(<ExpandedList {...props} {...{items}} />);
  };

  const getList = () => screen.getByRole('list');

  it('renders list', () => {
    renderListContainer();
    expect(getList()).toBeVisible();
  });

  it('renders list items', () => {
    renderListContainer();

    items.forEach(({label, content}) => {
      const itemLabel = screen.getByText(label);
      const itemContent = itemLabel.nextElementSibling;

      expect(itemLabel).toBeVisible();
      expect(itemContent).toHaveTextContent(content);
    });
  });

  it('renders list with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'color: red;';

    renderListContainer({className});
    const list = getList();

    expect(list).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(list).toHaveStyle(classStyle);
  });
});
