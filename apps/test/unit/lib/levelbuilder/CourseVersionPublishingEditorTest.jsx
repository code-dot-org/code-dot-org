import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import CourseVersionPublishingEditor from '@cdo/apps/lib/levelbuilder/CourseVersionPublishingEditor';
import {PublishedState} from '@cdo/apps/util/sharedConstants';

describe('CourseVersionPublishedStateSelector', () => {
  let defaultProps,
    updatePilotExperiment,
    updateFamilyName,
    updatePublishedState,
    updateVersionYear,
    updateIsCourse;

  beforeEach(() => {
    updatePilotExperiment = sinon.spy();
    updateFamilyName = sinon.spy();
    updateVersionYear = sinon.spy();
    updateIsCourse = sinon.spy();
    updatePublishedState = sinon.spy();
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
      publishedState: PublishedState.beta
    };
  });

  it('pilot input field shows if published state is pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        publishedState={PublishedState.pilot}
        pilotExperiment={'my-pilot'}
      />
    );
    expect(wrapper.find('.publishedStateSelector').props().value).to.equal(
      PublishedState.pilot
    );
    expect(wrapper.find('.pilotExperimentInput').length).to.equal(1);
  });

  it('pilot input field does not show if published state is not pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );
    expect(wrapper.find('.publishedStateSelector').props().value).to.equal(
      PublishedState.beta
    );
    expect(wrapper.find('.pilotExperimentInput').length).to.equal(0);
  });

  it('updates pilotExperiment when publish state changed to in-development', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.in_development}});

    expect(updatePilotExperiment).to.have.been.calledWith('');
  });

  it('updates pilotExperiment when publish state changed to beta', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.beta}});

    expect(updatePilotExperiment).to.have.been.calledWith('');
  });

  it('updates pilotExperiment when publish state changed to preview', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.preview}});

    expect(updatePilotExperiment).to.have.been.calledWith('');
  });

  it('updates pilotExperiment when publish state changed to stable', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: PublishedState.stable}});

    expect(updatePilotExperiment).to.have.been.calledWith('');
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
    expect(wrapper.find('.isCourseCheckbox').props().disabled).to.be.true;
    expect(wrapper.find('.familyNameSelector').props().disabled).to.be.true;
    expect(wrapper.find('.versionYearSelector').props().disabled).to.be.true;
  });

  it('hides family name and version year selectors if isCourse is false', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} isCourse={false} />
    );
    expect(wrapper.find('.familyNameSelector').length).to.equal(0);
    expect(wrapper.find('.versionYearSelector').length).to.equal(0);
  });

  it('shows family name and version year selectors when isCourse is true', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} isCourse />
    );
    expect(wrapper.find('.familyNameSelector').length).to.equal(1);
    expect(wrapper.find('.versionYearSelector').length).to.equal(1);
  });

  it('disables family name selector if inputting new family name', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} isCourse />
    );
    wrapper
      .instance()
      .handleNewFamilyNameChange({target: {value: 'new-family'}});
    expect(wrapper.find('.familyNameSelector').props().disabled).to.be.true;
  });
});
