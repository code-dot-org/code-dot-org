import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ActivitySectionCardButtons from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCardButtons';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('ActivitySectionCardButtons', () => {
  let defaultProps, addTip, editTip, addLevel;
  beforeEach(() => {
    addTip = sinon.spy();
    editTip = sinon.spy();
    addLevel = sinon.spy();
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[1],
      addTip,
      editTip,
      addLevel
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(3);
    expect(wrapper.find('AddResourceDialog').length).to.equal(1);
    expect(wrapper.find('AddLevelDialog').length).to.equal(1);
    expect(wrapper.find('EditTipDialog').length).to.equal(1);
    expect(wrapper.find('LessonTipIconWithTooltip').length).to.equal(1);
  });

  it('add level pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(0);
    expect(button.text()).to.include('Level');
    button.simulate('mouseDown');
    expect(wrapper.state().addLevelOpen).to.equal(true);
  });

  it('edit tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const tip = wrapper.find('LessonTipIconWithTooltip');
    tip.simulate('click');
    expect(wrapper.state().addTipOpen).to.equal(true);
    expect(wrapper.state().editingExistingTip).to.equal(true);
  });

  it('add tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(1);
    expect(button.text()).to.include('Tip');
    button.simulate('mouseDown');
    expect(wrapper.state().addTipOpen).to.equal(true);
  });

  it('add resource link pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(2);
    expect(button.text()).to.include('Resource Link');
    button.simulate('mouseDown');
    expect(wrapper.state().addResourceOpen).to.equal(true);
  });
});
