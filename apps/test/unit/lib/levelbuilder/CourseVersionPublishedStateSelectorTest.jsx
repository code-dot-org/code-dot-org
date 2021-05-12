import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import CourseVersionPublishedStateSelector from '../../../../src/lib/levelbuilder/CourseVersionPublishedStateSelector';

describe('CourseVersionPublishedStateSelector', () => {
  let defaultProps, updateVisible, updatePilotExperiment;

  beforeEach(() => {
    updateVisible = sinon.spy();
    updatePilotExperiment = sinon.spy();
    defaultProps = {
      visible: true,
      updatePilotExperiment,
      updateVisible,
      pilotExperiment: null
    };
  });

  it('test', () => {
    const wrapper = shallow(
      <CourseVersionPublishedStateSelector {...defaultProps} />
    );
    expect(wrapper.find('select').length).to.equal(1);
  });
});
