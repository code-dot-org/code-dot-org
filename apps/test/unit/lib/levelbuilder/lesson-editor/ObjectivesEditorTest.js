import React from 'react';
import {shallow} from 'enzyme';
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
    const wrapper = shallow(<ObjectivesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(2);
  });

  it('can remove a objective', () => {
    const wrapper = shallow(<ObjectivesEditor {...defaultProps} />);
    const numObjectives = wrapper.find('tr').length;
    expect(numObjectives).at.least(2);
    // Find one of thet "remove" buttons and click it
    const removeObjectiveButton = wrapper
      .find('.fa-trash')
      .first()
      .parent();
    removeObjectiveButton.simulate('mouseDown');
    expect(updateObjectives).to.have.been.calledWith([]);
  });

  it('can add a objective', () => {
    const wrapper = shallow(<ObjectivesEditor {...defaultProps} />);
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
    const objectiveInput = wrapper.find('input[type="text"]').first();
    objectiveInput.simulate('change', {target: {value: 'new description'}});
    objectiveInput.simulate('keyDown', {key: 'Enter'});
    expect(updateObjectives).to.have.been.calledWith([
      {description: 'new description', key: '1'},
      {description: '', key: 'objective-2'}
    ]);
  });

  it('does not add an objective after add and cancel', () => {
    const wrapper = shallow(<ObjectivesEditor {...defaultProps} />);
    const numObjectives = wrapper.find('tr').length;
    const addObjectiveButton = wrapper.find('button').first();
    addObjectiveButton.simulate('mouseDown');
    const cancelEditButton = wrapper
      .find('.fa-times')
      .first()
      .parent();
    cancelEditButton.simulate('mouseDown');
    expect(wrapper.find('tr').length).to.equal(numObjectives);
  });
});
