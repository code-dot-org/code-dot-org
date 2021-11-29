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
    uploadImage,
    removeTip,
    appendProgrammingExpressionLink,
    appendResourceLink,
    appendVocabularyLink,
    appendSlide;
  beforeEach(() => {
    addTip = sinon.spy();
    updateTip = sinon.spy();
    addLevel = sinon.spy();
    uploadImage = sinon.spy();
    removeTip = sinon.spy();
    appendProgrammingExpressionLink = sinon.spy();
    appendResourceLink = sinon.spy();
    appendVocabularyLink = sinon.spy();
    appendSlide = sinon.spy();
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[1],
      activityPosition: 1,
      addTip,
      updateTip,
      addLevel,
      uploadImage,
      removeTip,
      appendProgrammingExpressionLink,
      appendResourceLink,
      appendVocabularyLink,
      appendSlide,
      hasLessonPlan: true,
      vocabularies: []
    };
  });

  it('renders only level button when hasLessonPlan false', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    expect(wrapper.find('AddButton').length).to.equal(6);
    wrapper.setProps({hasLessonPlan: false});
    expect(wrapper.find('AddButton').length).to.equal(1);
  });

  it('opens "add level" dialog when button pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Level'});
    const handler = button.prop('handler');

    expect(wrapper.state().addLevelOpen).to.equal(false);
    handler();
    expect(wrapper.state().addLevelOpen).to.equal(true);
  });

  it('edit tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const tip = wrapper.find('LessonTipIconWithTooltip').at(0);

    expect(wrapper.state().editingExistingTip).to.equal(false);
    expect(wrapper.state().tipToEdit).to.be.null;
    tip.simulate('click');
    expect(wrapper.state().editingExistingTip).to.equal(true);
    expect(wrapper.state().tipToEdit).to.not.be.null;
  });

  it('add tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Callout'});
    const handler = button.prop('handler');

    expect(wrapper.state().tipToEdit).to.be.null;
    handler();
    expect(wrapper.state().tipToEdit).to.not.be.null;
  });

  it('add resource link pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Resource'});
    const handler = button.prop('handler');

    expect(wrapper.state().addResourceOpen).to.equal(false);
    handler();
    expect(wrapper.state().addResourceOpen).to.equal(true);
  });

  it('add vocabulary link pressed', () => {
    const wrapper = shallow(
      <ActivitySectionCardButtons
        {...defaultProps}
        vocabularies={[
          {
            id: 1,
            key: 'word1',
            word: 'word1',
            definition: 'definition1',
            commonSenseMedia: false
          }
        ]}
      />
    );

    const button = wrapper.find('AddButton').filter({displayText: 'Vocab'});
    const handler = button.prop('handler');

    expect(wrapper.state().addVocabularyOpen).to.equal(false);
    handler();
    expect(wrapper.state().addVocabularyOpen).to.equal(true);
  });

  it('add slide pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Slide'});
    const handler = button.prop('handler');

    expect(appendSlide).to.not.have.been.calledOnce;
    handler();
    expect(appendSlide).to.have.been.calledOnce;
  });

  it('add image pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Image'});
    const handler = button.prop('handler');

    expect(wrapper.state().uploadImageOpen).to.equal(false);
    handler();
    expect(wrapper.state().uploadImageOpen).to.equal(true);
  });

  it('add code doc pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Code Doc'});
    const handler = button.prop('handler');

    expect(wrapper.state().addProgrammingExpressionOpen).to.equal(false);
    handler();
    expect(wrapper.state().addProgrammingExpressionOpen).to.equal(true);
  });
});
