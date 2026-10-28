import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ObjectivesEditor from '@cdo/apps/levelbuilder/lesson-editor/ObjectivesEditor';

import {allowConsoleWarnings} from '../../../util/throwOnConsole';

describe('ObjectivesEditor', () => {
  // Warnings allowed due to usage of deprecated componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

  let defaultProps, updateObjectives;
  beforeEach(() => {
    updateObjectives = jest.fn();
    defaultProps = {
      objectives: [{key: '1', description: 'description'}],
      updateObjectives,
      scriptLevels: [],
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).toBe(2);
  });

  it('can remove an objective', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const numObjectives = wrapper.find('tr').length;
    expect(numObjectives).toBeGreaterThanOrEqual(2);
    // Find one of thet "remove" buttons and click it
    const removeObjectiveButton = wrapper.find('.unit-test-remove-objective');
    removeObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).toHaveBeenCalledWith([]);
  });

  it('can add an objective', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const addObjectiveButton = wrapper
      .find('button')
      .filterWhere(button => button.text().includes('Create New Objective'));
    addObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).toHaveBeenCalledWith([
      {description: 'description', key: '1'},
      {description: '', key: 'objective-2', scriptLevelIds: []},
    ]);
    wrapper.setProps({
      objectives: [
        {description: 'description', key: '1'},
        {description: '', key: 'objective-2', scriptLevelIds: []},
      ],
    });

    updateObjectives.mockReset();
    const objectiveInput = wrapper
      .find('ObjectiveLine')
      .at(1)
      .find('input[type="text"]')
      .first();
    objectiveInput.simulate('change', {target: {value: 'new description'}});
    objectiveInput.simulate('keyDown', {key: 'Enter'});
    expect(updateObjectives).toHaveBeenCalledWith([
      {description: 'description', key: '1'},
      {description: 'new description', key: 'objective-2', scriptLevelIds: []},
    ]);
  });

  it('does not add an objective after add and cancel', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const addObjectiveButton = wrapper
      .find('button')
      .filterWhere(button => button.text().includes('Create New Objective'));
    addObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).toHaveBeenCalledWith([
      {description: 'description', key: '1'},
      {description: '', key: 'objective-2', scriptLevelIds: []},
    ]);
    wrapper.setProps({
      objectives: [
        {description: 'description', key: '1'},
        {description: '', key: 'objective-2', scriptLevelIds: []},
      ],
    });

    updateObjectives.mockReset();
    const cancelEditButton = wrapper
      .find('ObjectiveLine')
      .last()
      .find('.unit-test-cancel-edit')
      .first();
    cancelEditButton.simulate('mouseDown');
    expect(updateObjectives).toHaveBeenCalledWith([
      {description: 'description', key: '1'},
    ]);
  });

  it('tags an objective with a level', () => {
    const wrapper = mount(
      <ObjectivesEditor
        {...defaultProps}
        objectives={[
          {key: '1', description: 'description', scriptLevelIds: []},
        ]}
        scriptLevels={[{id: '5', label: '1. level one'}]}
      />
    );
    wrapper
      .find('button')
      .filterWhere(b => b.text() === 'Tag levels')
      .simulate('click');
    wrapper.find('input[type="checkbox"]').simulate('change');
    expect(updateObjectives).toHaveBeenCalledWith([
      {key: '1', description: 'description', scriptLevelIds: ['5']},
    ]);
  });
});
