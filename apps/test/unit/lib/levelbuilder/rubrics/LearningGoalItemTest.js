import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LearningGoalItem from '@cdo/apps/lib/levelbuilder/rubrics/LearningGoalItem';
import sinon from 'sinon';

describe('LearningGoalItem', () => {
  let defaultProps;
  let deleteItemSpy = sinon.spy();

  beforeEach(() => {
    defaultProps = {
      deleteItem: deleteItemSpy,
    };
  });

  it('renders correctly', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    expect(wrapper.find('.uitest-learning-goal-card').length).to.equal(1);
    expect(wrapper.find('.uitest-rubric-key-concept-input').length).to.equal(1);
    expect(wrapper.find('input[type="checkbox"]').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
    expect(wrapper.find('EvidenceDescriptions').length).to.equal(1);
  });

  it('toggles AI checkbox and enables editing of AI textboxes when checked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.prop('checked')).to.be.false;
    expect(wrapper.find('EvidenceDescriptions').at(0).props().isAiEnabled).to.be
      .false;
    checkbox.simulate('change');
    expect(wrapper.find('input[type="checkbox"]').prop('checked')).to.be.true;
    expect(wrapper.find('EvidenceDescriptions').at(0).props().isAiEnabled).to.be
      .true;
  });

  it('calls deleteItem when delete button is clicked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(deleteItemSpy.calledOnce).to.be.true;
  });
});
