import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import Button from '@cdo/apps/templates/Button';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import {UnconnectedSetUpSections as SetUpSections} from '@cdo/apps/templates/studioHomepages/SetUpSections';

describe('SetUpSections', () => {
  it('renders as expected', () => {
    const wrapper = shallow(
      <SetUpSections beginEditingNewSection={() => {}} />
    );
    const instance = wrapper.instance();

    expect(
      wrapper.containsMatchingElement(
        <BorderedCallToAction
          type="sections"
          headingText="Set up your classroom"
          descriptionText="Create a new classroom section to start assigning courses and seeing your student progress."
          buttonText="Create a section"
          onClick={instance.beginEditingNewSection}
        />
      )
    );
  });

  it('calls beginEditingNewSection with no arguments when button is clicked', () => {
    const spy = sinon.spy();
    const wrapper = mount(<SetUpSections beginEditingNewSection={spy} />);
    expect(spy).not.to.have.been.called;

    wrapper.find(Button).simulate('click', {fake: 'event'});
    expect(spy).to.have.been.calledOnce;
    expect(spy.firstCall.args).to.be.empty;
  });
});
