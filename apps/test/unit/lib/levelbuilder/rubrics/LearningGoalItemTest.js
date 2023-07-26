import React from 'react';
import {mount, shallow} from 'enzyme';
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
    const wrapper = mount(<LearningGoalItem {...defaultProps} />);
    expect(wrapper.find('.uitest-learning-goal-card').length).to.equal(1);
    expect(wrapper.find('.uitest-rubric-key-concept-input').length).to.equal(1);
    expect(wrapper.find('input[type="checkbox"]').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(1);
    expect(wrapper.find('textarea').length).to.equal(8);
  });

  it('toggles AI checkbox and enables editing of AI textboxes when checked', () => {
    const wrapper = mount(<LearningGoalItem {...defaultProps} />);
    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(wrapper.find('.ui-test-ai-prompt-textbox').length).to.equal(4);
    expect(checkbox.prop('checked')).to.be.false;
    expect(wrapper.find('.ui-test-ai-prompt-textbox').at(1).prop('disabled')).to
      .be.true;
    checkbox.simulate('change');
    expect(wrapper.find('input[type="checkbox"]').prop('checked')).to.be.true;
    expect(wrapper.find('.ui-test-ai-prompt-textbox').at(1).prop('disabled')).to
      .be.false;
  });

  it('calls deleteItem when delete button is clicked', () => {
    const wrapper = shallow(<LearningGoalItem {...defaultProps} />);
    wrapper.find('Button').simulate('click');
    expect(deleteItemSpy.calledOnce).to.be.true;
  });
});
