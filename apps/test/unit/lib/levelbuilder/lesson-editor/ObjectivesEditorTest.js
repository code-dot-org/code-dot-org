import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ObjectivesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ObjectivesEditor';
import sinon from 'sinon';

describe('ObjectivesEditor', () => {
  let defaultProps, updateObjectives;
  beforeEach(() => {
    updateObjectives = sinon.spy();
    defaultProps = {
      objectives: [{key: '1', description: 'description'}],
      updateObjectives
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(2);
  });

  it('can remove an objective', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const numObjectives = wrapper.find('tr').length;
    expect(numObjectives).at.least(2);
    // Find one of thet "remove" buttons and click it
    const removeObjectiveButton = wrapper.find('.unit-test-remove-objective');
    removeObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).to.have.been.calledWith([]);
  });

  it('can add an objective', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const addObjectiveButton = wrapper.find('button').first();
    addObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).to.have.been.calledWith([
      {description: 'description', key: '1'},
      {description: '', key: 'objective-2'}
    ]);
    wrapper.setProps({
      objectives: [
        {description: 'description', key: '1'},
        {description: '', key: 'objective-2'}
      ]
    });

    updateObjectives.resetHistory();
    const objectiveInput = wrapper
      .find('ObjectiveLine')
      .at(1)
      .find('input[type="text"]')
      .first();
    objectiveInput.simulate('change', {target: {value: 'new description'}});
    objectiveInput.simulate('keyDown', {key: 'Enter'});
    expect(updateObjectives).to.have.been.calledWith([
      {description: 'description', key: '1'},
      {description: 'new description', key: 'objective-2'}
    ]);
  });

  it('does not add an objective after add and cancel', () => {
    const wrapper = mount(<ObjectivesEditor {...defaultProps} />);
    const addObjectiveButton = wrapper.find('button').first();
    addObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).to.have.been.calledWith([
      {description: 'description', key: '1'},
      {description: '', key: 'objective-2'}
    ]);
    wrapper.setProps({
      objectives: [
        {description: 'description', key: '1'},
        {description: '', key: 'objective-2'}
      ]
    });

    updateObjectives.resetHistory();
    const cancelEditButton = wrapper
      .find('ObjectiveLine')
      .last()
      .find('.unit-test-cancel-edit')
      .first();
    cancelEditButton.simulate('mouseDown');
    expect(updateObjectives).to.have.been.calledWith([
      {description: 'description', key: '1'}
    ]);
  });
});
