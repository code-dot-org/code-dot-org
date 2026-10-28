import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import ObjectiveLevelTags from '@cdo/apps/levelbuilder/lesson-editor/ObjectiveLevelTags';

describe('ObjectiveLevelTags', () => {
  const scriptLevels = [
    {id: '1', label: '1. first level'},
    {id: '2', label: '2. second level'},
  ];

  const renderTags = props => {
    const onChange = jest.fn();
    render(
      <ObjectiveLevelTags
        objectiveDescription="Loops"
        scriptLevels={scriptLevels}
        scriptLevelIds={[]}
        onChange={onChange}
        {...props}
      />
    );
    return onChange;
  };

  const expand = () =>
    fireEvent.click(
      screen.getByRole('button', {name: 'Tag levels for objective: Loops'})
    );

  it('summarizes tagged levels and ignores ids no longer in the lesson', () => {
    renderTags({scriptLevelIds: ['2', 'removed']});

    expect(screen.getByText('2. second level')).toBeInTheDocument();
    expect(screen.queryByText(/first level/)).not.toBeInTheDocument();
  });

  it('says so when no levels are tagged', () => {
    renderTags();

    expect(screen.getByText('No levels')).toBeInTheDocument();
  });

  it('hides the level list until expanded', () => {
    renderTags();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    expand();

    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(
      screen.getByRole('button', {name: 'Tag levels for objective: Loops'})
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('adds a level when its box is checked', () => {
    const onChange = renderTags({scriptLevelIds: ['1']});
    expand();

    fireEvent.click(screen.getByRole('checkbox', {name: '2. second level'}));

    expect(onChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('removes a level when its box is unchecked', () => {
    const onChange = renderTags({scriptLevelIds: ['1', '2']});
    expand();

    fireEvent.click(screen.getByRole('checkbox', {name: '1. first level'}));

    expect(onChange).toHaveBeenCalledWith(['2']);
  });

  it('explains why there is nothing to tag', () => {
    renderTags({scriptLevels: []});
    expand();

    expect(
      screen.getByText('Save the lesson to tag newly added levels.')
    ).toBeInTheDocument();
  });
});
