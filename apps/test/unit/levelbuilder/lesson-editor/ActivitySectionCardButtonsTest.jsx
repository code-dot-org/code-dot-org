import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedActivitySectionCardButtons as ActivitySectionCardButtons} from '@cdo/apps/levelbuilder/lesson-editor/ActivitySectionCardButtons';

import {sampleActivities} from './activitiesTestData';

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
    addTip = jest.fn();
    updateTip = jest.fn();
    addLevel = jest.fn();
    uploadImage = jest.fn();
    removeTip = jest.fn();
    appendProgrammingExpressionLink = jest.fn();
    appendResourceLink = jest.fn();
    appendVocabularyLink = jest.fn();
    appendSlide = jest.fn();
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
      allowMajorCurriculumChanges: true,
      isLastActivity: false,
      isLastActivitySection: false,
      vocabularies: [],
    };
  });

  it('renders only level button when hasLessonPlan false', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);

    expect(wrapper.find('AddButton').length).toBe(6);
    wrapper.setProps({hasLessonPlan: false});
    expect(wrapper.find('AddButton').length).toBe(1);
  });

  it('hides add level button if major curriculum changes are not allowed and isLastActivitySection is false', () => {
    const wrapper = shallow(
      <ActivitySectionCardButtons
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        isLastActivity={true}
        isLastActivitySection={false}
      />
    );

    expect(wrapper.find('.uitest-open-add-level-button').length).toBe(0);
  });

  it('hides add level button if major curriculum changes are not allowed and isLastActivity is false', () => {
    const wrapper = shallow(
      <ActivitySectionCardButtons
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        isLastActivity={false}
        isLastActivitySection={true}
      />
    );

    expect(wrapper.find('.uitest-open-add-level-button').length).toBe(0);
  });

  it('shows add level button if major curriculum changes are not allowed but isLastActivity and isLastActivitySection are true', () => {
    const wrapper = shallow(
      <ActivitySectionCardButtons
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        isLastActivity={true}
        isLastActivitySection={true}
      />
    );

    expect(wrapper.find('.uitest-open-add-level-button').length).toBe(1);
  });

  it('shows add level button if major curriculum changes are allowed', () => {
    const wrapper = shallow(
      <ActivitySectionCardButtons
        {...defaultProps}
        allowMajorCurriculumChanges={true}
        isLastActivity={false}
        isLastActivitySection={false}
      />
    );

    expect(wrapper.find('.uitest-open-add-level-button').length).toBe(1);
  });

  it('shows add level button if major curriculum changes are allowed', () => {
    const wrapper = shallow(
      <ActivitySectionCardButtons
        {...defaultProps}
        allowMajorCurriculumChanges={true}
      />
    );

    expect(wrapper.find('.uitest-open-add-level-button').length).toBe(1);
  });

  it('opens "add level" dialog when button pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Level'});
    const handler = button.prop('handler');

    expect(wrapper.state().addLevelOpen).toBe(false);
    handler();
    expect(wrapper.state().addLevelOpen).toBe(true);
  });

  it('edit tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const tip = wrapper.find('LessonTipIconWithTooltip').at(0);

    expect(wrapper.state().editingExistingTip).toBe(false);
    expect(wrapper.state().tipToEdit).toBeNull();
    tip.simulate('click');
    expect(wrapper.state().editingExistingTip).toBe(true);
    expect(wrapper.state().tipToEdit).not.toBeNull();
  });

  it('add tip pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Callout'});
    const handler = button.prop('handler');

    expect(wrapper.state().tipToEdit).toBeNull();
    handler();
    expect(wrapper.state().tipToEdit).not.toBeNull();
  });

  it('add resource link pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Resource'});
    const handler = button.prop('handler');

    expect(wrapper.state().addResourceOpen).toBe(false);
    handler();
    expect(wrapper.state().addResourceOpen).toBe(true);
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
            commonSenseMedia: false,
          },
        ]}
      />
    );

    const button = wrapper.find('AddButton').filter({displayText: 'Vocab'});
    const handler = button.prop('handler');

    expect(wrapper.state().addVocabularyOpen).toBe(false);
    handler();
    expect(wrapper.state().addVocabularyOpen).toBe(true);
  });

  it('add slide pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Slide'});
    const handler = button.prop('handler');

    expect(appendSlide).not.toHaveBeenCalledTimes(1);
    handler();
    expect(appendSlide).toHaveBeenCalledTimes(1);
  });

  it('add image pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Image'});
    const handler = button.prop('handler');

    expect(wrapper.state().uploadImageOpen).toBe(false);
    handler();
    expect(wrapper.state().uploadImageOpen).toBe(true);
  });

  it('add code doc pressed', () => {
    const wrapper = shallow(<ActivitySectionCardButtons {...defaultProps} />);
    const button = wrapper.find('AddButton').filter({displayText: 'Code Doc'});
    const handler = button.prop('handler');

    expect(wrapper.state().addProgrammingExpressionOpen).toBe(false);
    handler();
    expect(wrapper.state().addProgrammingExpressionOpen).toBe(true);
  });
});
