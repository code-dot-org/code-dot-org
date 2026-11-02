import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import AdaptiveTabBar from '@cdo/apps/adaptive/views/AdaptiveTabBar';

describe('AdaptiveTabBar', () => {
  it('renders both tab labels', () => {
    render(<AdaptiveTabBar activeTab="map" onTabChange={jest.fn()} />);
    expect(screen.getByRole('tab', {name: /My project/})).toBeTruthy();
    expect(screen.getByRole('tab', {name: /Practice skills/})).toBeTruthy();
  });

  it('marks the active tab as selected', () => {
    const {rerender} = render(
      <AdaptiveTabBar activeTab="map" onTabChange={jest.fn()} />
    );
    expect(screen.getByRole('tab', {name: /Practice skills/})).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', {name: /My project/})).toHaveAttribute(
      'aria-selected',
      'false'
    );

    rerender(<AdaptiveTabBar activeTab="project" onTabChange={jest.fn()} />);
    expect(screen.getByRole('tab', {name: /My project/})).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', {name: /Practice skills/})).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('calls onTabChange with the clicked tab value', () => {
    const onTabChange = jest.fn();
    render(<AdaptiveTabBar activeTab="map" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('tab', {name: /My project/}));

    expect(onTabChange).toHaveBeenCalledWith('project');
  });

  it('does not call onTabChange when clicking the already-active tab', () => {
    const onTabChange = jest.fn();
    render(<AdaptiveTabBar activeTab="map" onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('tab', {name: /Practice skills/}));

    expect(onTabChange).not.toHaveBeenCalled();
  });
});
