import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import CourseVersionPublishingEditor from '../../../../src/lib/levelbuilder/CourseVersionPublishingEditor';

describe('CourseVersionPublishedStateSelector', () => {
  let defaultProps,
    updateVisible,
    updatePilotExperiment,
    updateIsStable,
    updateFamilyName,
    updatePublishedState,
    updateVersionYear;

  beforeEach(() => {
    updateVisible = sinon.spy();
    updatePilotExperiment = sinon.spy();
    updateIsStable = sinon.spy();
    updateFamilyName = sinon.spy();
    updateVersionYear = sinon.spy();
    updatePublishedState = sinon.spy();
    defaultProps = {
      visible: false,
      isStable: false,
      pilotExperiment: null,
      versionYear: null,
      familyName: null,
      updatePilotExperiment,
      updateVisible,
      updateIsStable,
      updateFamilyName,
      updateVersionYear,
      updatePublishedState,
      families: ['family1', 'family2', 'family3'],
      versionYearOptions: ['1990', '1991', '1992'],
      publishedState: 'Beta'
    };
  });

  it('pilot input field shows if published state is pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor
        {...defaultProps}
        publishedState={'Pilot'}
        pilotExperiment={'my-pilot'}
      />
    );
    expect(wrapper.find('.publishedStateSelector').props().value).to.equal(
      'Pilot'
    );
    expect(wrapper.find('input').length).to.equal(1);
  });

  it('pilot input field does not show if published state is not pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );
    expect(wrapper.find('.publishedStateSelector').props().value).to.equal(
      'Beta'
    );
    expect(wrapper.find('input').length).to.equal(0);
  });

  it('updates visible, isStable, and pilotExperiment when publish state changed to pilot', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: 'Pilot'}});

    expect(updateVisible).to.have.been.calledWith(false);
    expect(updateIsStable).to.have.been.calledWith(false);
  });

  it('updates visible, isStable, and pilotExperiment when publish state changed to beta', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: 'Beta'}});

    expect(updateVisible).to.have.been.calledWith(false);
    expect(updateIsStable).to.have.been.calledWith(false);
    expect(updatePilotExperiment).to.have.been.calledWith('');
  });

  it('updates visible, isStable, and pilotExperiment when publish state changed to preview', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: 'Preview'}});

    expect(updateVisible).to.have.been.calledWith(true);
    expect(updateIsStable).to.have.been.calledWith(false);
    expect(updatePilotExperiment).to.have.been.calledWith('');
  });

  it('updates visible, isStable, and pilotExperiment when publish state changed to recommended', () => {
    const wrapper = shallow(
      <CourseVersionPublishingEditor {...defaultProps} />
    );

    wrapper
      .find('.publishedStateSelector')
      .simulate('change', {target: {value: 'Recommended'}});

    expect(updateVisible).to.have.been.calledWith(true);
    expect(updateIsStable).to.have.been.calledWith(true);
    expect(updatePilotExperiment).to.have.been.calledWith('');
  });
});
