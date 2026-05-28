import {render, screen} from '@testing-library/react';

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
    // jsdom's getComputedStyle returns colors in rgb form, so assert in rgb
    // (jest-environment-jsdom@29 used jsdom@20 which returned 'red' literally;
    // catalog's jsdom@26 normalizes to rgb).
    const classStyle = 'color: rgb(255, 0, 0);';

    renderListContainer({className});
    const list = getList();

    expect(list).not.toHaveStyle(classStyle);

    const style = document.createElement('style');
    style.innerHTML = `.${className} { color: red; }`;
    document.head.appendChild(style);

    expect(list).toHaveStyle(classStyle);
  });
});
