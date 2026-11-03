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

  it('checks the tagged levels and ignores ids no longer in the lesson', () => {
    renderTags({scriptLevelIds: ['2', 'removed']});

    expect(
      screen.getByRole('group', {name: 'Levels for objective: Loops'})
    ).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(
      screen.getByRole('checkbox', {name: '1. first level'})
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', {name: '2. second level'})
    ).toBeChecked();
  });

  it('adds a level when its box is checked', () => {
    const onChange = renderTags({scriptLevelIds: ['1']});

    fireEvent.click(screen.getByRole('checkbox', {name: '2. second level'}));

    expect(onChange).toHaveBeenCalledWith(['1', '2']);
  });

  it('removes a level when its box is unchecked', () => {
    const onChange = renderTags({scriptLevelIds: ['1', '2']});

    fireEvent.click(screen.getByRole('checkbox', {name: '1. first level'}));

    expect(onChange).toHaveBeenCalledWith(['2']);
  });

  it('explains why there is nothing to tag', () => {
    renderTags({scriptLevels: []});

    expect(
      screen.getByText('Save the lesson to tag newly added levels.')
    ).toBeInTheDocument();
  });
});
