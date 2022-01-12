import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import CourseVersionPublishingEditor from '@cdo/apps/lib/levelbuilder/CourseVersionPublishingEditor';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

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
      initialPublishedState: PublishedState.beta,
      publishedState: PublishedState.beta
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
    expect(
      wrapper.find('.publishedStateSelector').find('option').length
    ).to.equal(5);
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(0)
        .props().value
    ).to.equal('in_development');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(1)
        .props().value
    ).to.equal('pilot');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(2)
        .props().value
    ).to.equal('beta');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(3)
        .props().value
    ).to.equal('preview');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(4)
        .props().value
    ).to.equal('stable');
  });

  it('published state dropdown shows only available published states when course is pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.pilot}
        publishedState={PublishedState.pilot}
      />
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').length
    ).to.equal(1);
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .props().value
    ).to.equal('pilot');
  });

  it('published state dropdown shows only available published states when course is beta', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.beta}
        publishedState={PublishedState.beta}
      />
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').length
    ).to.equal(3);
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(0)
        .props().value
    ).to.equal('beta');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(1)
        .props().value
    ).to.equal('preview');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(2)
        .props().value
    ).to.equal('stable');
  });

  it('published state dropdown shows only available published states when course is preview', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.preview}
        publishedState={PublishedState.preview}
      />
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').length
    ).to.equal(2);
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(0)
        .props().value
    ).to.equal('preview');
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .at(1)
        .props().value
    ).to.equal('stable');
  });

  it('published state dropdown shows only available published states when course is stable', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        initialPublishedState={PublishedState.stable}
        publishedState={PublishedState.stable}
      />
    );
    expect(
      wrapper.find('.publishedStateSelector').find('option').length
    ).to.equal(1);
    expect(
      wrapper
        .find('.publishedStateSelector')
        .find('option')
        .props().value
    ).to.equal('stable');
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
