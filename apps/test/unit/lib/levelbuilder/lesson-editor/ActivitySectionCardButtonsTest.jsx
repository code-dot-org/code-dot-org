import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitySectionCardButtons as ActivitySectionCardButtons} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCardButtons';
import {sampleActivities} from './activitiesTestData';
import sinon from 'sinon';

describe('ActivitySectionCardButtons', () => {
  let defaultProps,
    addTip,
    updateTip,
    addLevel,
    removeTip,
    appendResourceLink,
    appendSlide;
  beforeEach(() => {
    addTip = sinon.spy();
    updateTip = sinon.spy();
    addLevel = sinon.spy();
    removeTip = sinon.spy();
    appendResourceLink = sinon.spy();
    appendSlide = sinon.spy();
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[1],
      activityPosition: 1,
      addTip,
      updateTip,
      addLevel,
      removeTip,
      appendResourceLink,
      appendSlide
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(4);
    expect(wrapper.find('Connect(FindResourceDialog)').length).to.equal(1);
    expect(wrapper.find('AddLevelDialog').length).to.equal(1);
    expect(wrapper.find('LessonTipIconWithTooltip').length).to.equal(2);
    // Don't render this component until add tip button or tip icon are clicked
    expect(wrapper.find('EditTipDialog').length).to.equal(0);
  });

  it('add level pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(0);
    expect(button.text()).to.include('Level');
    button.simulate('click');
    expect(wrapper.state().addLevelOpen).to.equal(true);
  });

  it('edit tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const tip = wrapper.find('LessonTipIconWithTooltip').at(0);
    tip.simulate('click');
    expect(wrapper.state().tipToEdit).to.not.be.null;
    expect(wrapper.state().editingExistingTip).to.equal(true);
  });

  it('add tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(1);
    expect(button.text()).to.include('Callout');
    button.simulate('mouseDown');
    expect(wrapper.state().tipToEdit).to.not.be.null;
  });

  it('add resource link pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(2);
    expect(button.text()).to.include('Resource Link');
    button.simulate('mouseDown');
    expect(wrapper.state().addResourceOpen).to.equal(true);
  });

  it('add slide pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    const button = wrapper.find('button').at(3);
    expect(button.text()).to.include('Slide');
    button.simulate('mouseDown');
    expect(appendSlide).to.have.been.calledOnce;
  });
});
