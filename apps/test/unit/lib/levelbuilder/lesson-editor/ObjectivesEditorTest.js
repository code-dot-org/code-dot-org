import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ObjectivesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ObjectivesEditor';

import {allowConsoleWarnings} from '../../../../util/throwOnConsole';

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
    const addObjectiveButton = wrapper.find('button').first();
    addObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).toHaveBeenCalledWith([
      {description: 'description', key: '1'},
      {description: '', key: 'objective-2'},
    ]);
    wrapper.setProps({
      objectives: [
        {description: 'description', key: '1'},
        {description: '', key: 'objective-2'},
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
      {description: 'new description', key: 'objective-2'},
    ]);
  });

  it('does not add an objective after add and cancel', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const addObjectiveButton = wrapper.find('button').first();
    addObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).toHaveBeenCalledWith([
      {description: 'description', key: '1'},
      {description: '', key: 'objective-2'},
    ]);
    wrapper.setProps({
      objectives: [
        {description: 'description', key: '1'},
        {description: '', key: 'objective-2'},
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
});
