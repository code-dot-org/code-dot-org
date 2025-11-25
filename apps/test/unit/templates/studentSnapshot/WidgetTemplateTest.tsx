import {render, screen} from '@testing-library/react';
import React from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';

describe('WidgetTemplate', () => {
  const defaultProps = {
    widgetName: 'Test Widget',
    gridWidth: 1,
    gridHeight: 1,
    children: <div>Test content</div>,
  };

  it('renders widget', () => {
    render(<WidgetTemplate {...defaultProps} />);

    screen.getByText('Test Widget');
    screen.getByText('Test content');
    screen.getByRole('button', {name: 'Settings'});
  });

  it('renders loading', () => {
    render(<WidgetTemplate {...defaultProps} loading={true} />);

    screen.getByText('Test Widget');
    expect(screen.queryByText('Test content')).toBeNull();
    screen.getByRole('button', {name: 'Settings'});
    screen.getByTitle('Loading...');
  });
});
