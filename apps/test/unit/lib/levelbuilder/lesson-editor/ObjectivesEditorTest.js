import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ObjectivesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ObjectivesEditor';

describe('ObjectivesEditor', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectives: [{id: 1, description: 'description'}]
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
    expect(wrapper.find('tr').length).to.equal(numObjectives - 1);
  });

  it('can add a objective', () => {
    const wrapper = shallow(<ObjectivesEditor {...defaultProps} />);
    const numObjectives = wrapper.find('tr').length;
    const addObjectiveButton = wrapper.find('button').first();
    addObjectiveButton.simulate('mouseDown');
    const objectiveInput = wrapper.find('input[type="text"]').first();
    objectiveInput.simulate('change', {target: {value: 'new description'}});
    objectiveInput.simulate('keyDown', {key: 'Enter'});
    expect(wrapper.find('tr').length).to.equal(numObjectives + 1);
  });

  it('does not add an empty objective', () => {
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
