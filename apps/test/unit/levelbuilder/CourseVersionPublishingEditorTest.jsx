import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import CourseVersionPublishingEditor from '@cdo/apps/levelbuilder/CourseVersionPublishingEditor';

describe('CourseVersionPublishingEditor', () => {
  let defaultProps,
    updatePilotExperiment,
    updateFamilyName,
    updatePublishedState,
    updateVersionYear,
    updateIsCourse;

  beforeEach(() => {
    updatePilotExperiment = jest.fn();
    updateFamilyName = jest.fn();
    updateVersionYear = jest.fn();
    updateIsCourse = jest.fn();
    updatePublishedState = jest.fn();
    defaultProps = {
      pilotExperiment: null,
      versionYear: null,
      familyName: null,
      updatePilotExperiment,
      updateFamilyName,
      updateVersionYear,
      updateIsCourse,
      updatePublishedState,
      families: ['family1', 'family2', 'family3'],
      versionYearOptions: ['1990', '1991', '1992'],
      initialPublishedState: PublishedState.beta,
      publishedState: PublishedState.beta,
      courseOfferingEditorLink: null,
    };
  });

  it('published state dropdown shows only available published states when course is in development', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.in_development}
        publishedState={PublishedState.in_development}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      7
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(0).props().value
    ).toBe('in_development');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(1).props().value
    ).toBe('pilot');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(2).props().value
    ).toBe('beta');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(3).props().value
    ).toBe('preview');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(4).props().value
    ).toBe('stable');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(5).props().value
    ).toBe('sunsetting');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(6).props().value
    ).toBe('deprecated');
  });

  it('published state dropdown shows only available published states when course is pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.pilot}
        publishedState={PublishedState.pilot}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      3
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(0).props().value
    ).toBe('pilot');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(1).props().value
    ).toBe('sunsetting');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(2).props().value
    ).toBe('deprecated');
  });

  it('published state dropdown shows only available published states when course is beta', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.beta}
        publishedState={PublishedState.beta}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      5
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(0).props().value
    ).toBe('beta');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(1).props().value
    ).toBe('preview');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(2).props().value
    ).toBe('stable');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(3).props().value
    ).toBe('sunsetting');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(4).props().value
    ).toBe('deprecated');
  });

  it('published state dropdown shows only available published states when course is preview', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.preview}
        publishedState={PublishedState.preview}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      4
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(0).props().value
    ).toBe('preview');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(1).props().value
    ).toBe('stable');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(2).props().value
    ).toBe('sunsetting');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(3).props().value
    ).toBe('deprecated');
  });

  it('published state dropdown shows only available published states when course is stable', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.stable}
        publishedState={PublishedState.stable}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      3
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(0).props().value
    ).toBe('stable');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(1).props().value
    ).toBe('sunsetting');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(2).props().value
    ).toBe('deprecated');
  });

  it('published state dropdown shows only available published states when course is sunsetting', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.sunsetting}
        publishedState={PublishedState.sunsetting}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      2
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(0).props().value
    ).toBe('sunsetting');
    expect(
      wrapper.find('.publishedStateSelector').find('option').at(1).props().value
    ).toBe('deprecated');
  });

  it('published state dropdown shows only available published states when course is deprecated', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.deprecated}
        publishedState={PublishedState.deprecated}
      />
    );
    expect(wrapper.find('.publishedStateSelector').find('option').length).toBe(
      1
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').props().value
    ).toBe('deprecated');
  });

  it('pilot input field shows if published state is pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        publishedState={PublishedState.pilot}
        pilotExperiment={'my-pilot'}
      />
    );
    expect(wrapper.find('.publishedStateSelector').props().value).toBe(
      PublishedState.pilot
    );
    expect(wrapper.find('.pilotExperimentInput').length).toBe(1);
  });

  it('pilot input field does not show if published state is not pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );
    expect(wrapper.find('.publishedStateSelector').props().value).toBe(
      PublishedState.beta
    );
    expect(wrapper.find('.pilotExperimentInput').length).toBe(0);
  });

  it('updates pilotExperiment when publish state changed to in-development', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.in_development}});

    expect(updatePilotExperiment).toHaveBeenCalledWith('');
  });

  it('updates pilotExperiment when publish state changed to beta', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.beta}});

    expect(updatePilotExperiment).toHaveBeenCalledWith('');
  });

  it('updates pilotExperiment when publish state changed to preview', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.preview}});

    expect(updatePilotExperiment).toHaveBeenCalledWith('');
  });

  it('updates pilotExperiment when publish state changed to stable', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.stable}});

    expect(updatePilotExperiment).toHaveBeenCalledWith('');
  });

  it('disables familyName and versionYear selectors if preventCourseVersionChange', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        showIsCourseSelector
        isCourse
        preventCourseVersionChange
      />
    );
    expect(wrapper.find('.isCourseCheckbox').props().disabled).toBe(true);
    expect(wrapper.find('.familyNameSelector').props().disabled).toBe(true);
    expect(wrapper.find('.versionYearSelector').props().disabled).toBe(true);
  });

  it('hides family name and version year selectors if isCourse is false', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} isCourse={false} />
    );
    expect(wrapper.find('.familyNameSelector').length).toBe(0);
    expect(wrapper.find('.versionYearSelector').length).toBe(0);
  });

  it('shows family name and version year selectors when isCourse is true', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} isCourse />
    );
    expect(wrapper.find('.familyNameSelector').length).toBe(1);
    expect(wrapper.find('.versionYearSelector').length).toBe(1);
  });

  it('disables family name selector if inputting new family name', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} isCourse />
    );
    wrapper
      .instance()
      .handleNewFamilyNameChange({target: {value: 'new-family'}});
    expect(wrapper.find('.familyNameSelector').props().disabled).toBe(true);
  });

  it('displays course offering editor button when courseOfferingEditorLink', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        courseOfferingEditorLink={'/link/link'}
      />
    );
    expect(wrapper.find('Button').length).toBe(1);
    expect(wrapper.find('Button').props().text).toBe('Edit Course Offering');
    expect(wrapper.find('Button').props().href).toBe('/link/link');
  });

  it('does not display course offering editor button when courseOfferingEditorLink is null', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        courseOfferingEditorLink={null}
      />
    );
    expect(wrapper.find('Button').length).toBe(0);
  });
});
