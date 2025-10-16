import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import Snapshot, {SnapshotItem, SnapshotProps} from '../Snapshot';

describe('CMS Snapshot', () => {
  const title = 'Snapshot Title';
  const items: SnapshotItem[] = [
    {
      key: 'grades',
      icon: {iconName: 'user'},
      label: 'Grades',
      content: 'K-5',
    },
  ];

  const renderSnapshot = (props: Partial<SnapshotProps> = {}) => {
    render(<Snapshot {...props} title={title} items={items} />);
  };

  const getSnapshot = () => screen.getByTitle(title);

  it('renders snapshot section with provided items', () => {
    renderSnapshot();

    const snapshot = getSnapshot();
    expect(snapshot).toBeVisible();

    const itemLabel = within(snapshot).getByText(items[0].label + ':');
    expect(itemLabel).toBeVisible();

    const itemContent = within(snapshot).getByText(items[0].content as string);
    expect(itemContent).toBeVisible();
  });

  it('renders snapshot section with provided className styles', () => {
    const className = 'customClass';
    const classStyle = 'color: red;';

    renderSnapshot({className});
    const snapshot = getSnapshot();

    expect(snapshot).not.toHaveStyle(classStyle);

    // Add custom CSS directly in the test
    const style = document.createElement('style');
    style.innerHTML = `.${className} { ${classStyle} }`;
    document.head.appendChild(style);

    expect(snapshot).toHaveStyle(classStyle);
  });
});
