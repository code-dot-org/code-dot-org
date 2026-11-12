import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import AdaptiveTabBar from '@cdo/apps/adaptive/views/AdaptiveTabBar';

jest.mock('@cdo/apps/adaptive/views/MapStats', () => ({
  __esModule: true,
  default: ({
    skills,
    timeSpentSeconds,
  }: {
    skills: unknown[];
    timeSpentSeconds: number;
  }) => (
    <div>
      stats: {skills.length} skills, {timeSpentSeconds}s
    </div>
  ),
}));

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

  it('shows the project name in the project tab when projectName is given', () => {
    render(
      <AdaptiveTabBar
        activeTab="map"
        onTabChange={jest.fn()}
        projectName="Cool Website"
      />
    );
    expect(screen.getByRole('tab', {name: /Cool Website/})).toBeTruthy();
    expect(screen.queryByRole('tab', {name: /My project/})).toBeNull();
  });

  it('falls back to "My project" when projectName is not given', () => {
    render(<AdaptiveTabBar activeTab="map" onTabChange={jest.fn()} />);
    expect(screen.getByRole('tab', {name: /My project/})).toBeTruthy();
  });

  describe('MapStats', () => {
    const skills = [{key: 'html', title: 'HTML', done: 1, total: 2}];

    it('renders MapStats when skills and timeSpentSeconds are provided', () => {
      render(
        <AdaptiveTabBar
          activeTab="map"
          onTabChange={jest.fn()}
          skills={skills}
          timeSpentSeconds={300}
        />
      );
      expect(screen.getByText('stats: 1 skills, 300s')).toBeTruthy();
    });

    it('does not render MapStats when stats props are absent', () => {
      render(<AdaptiveTabBar activeTab="map" onTabChange={jest.fn()} />);
      expect(screen.queryByText(/stats:/)).toBeNull();
    });
  });
});
