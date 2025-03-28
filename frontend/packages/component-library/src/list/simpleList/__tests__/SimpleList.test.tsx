import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import SimpleList, {SimpleListProps} from '../SimpleList';

describe('Design System - SimpleList', () => {
  const items = [
    {key: 'item-a', label: 'Item A'},
    {key: 'item-b', label: 'Item B'},
  ];

  const renderListContainer = (props: Partial<SimpleListProps> = {}) => {
    render(<SimpleList {...props} {...{items}} />);
  };

  const getList = () => screen.getByRole('list');

  it('renders list', () => {
    renderListContainer();
    expect(getList()).toBeVisible();
  });

  it('renders list items', () => {
    renderListContainer();

    items.forEach(({label}) => {
      expect(screen.getByText(label)).toBeVisible();
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
