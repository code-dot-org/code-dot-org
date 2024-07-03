import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import {PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import BorderedCallToAction from '@cdo/apps/templates/studioHomepages/BorderedCallToAction';
import {UnconnectedSetUpSections as SetUpSections} from '@cdo/apps/templates/studioHomepages/SetUpSections';



describe('SetUpSections', () => {
  it('renders as expected', () => {
    const wrapper = shallow(<SetUpSections beginEditingSection={() => {}} />);
    const instance = wrapper.instance();

    expect(
      wrapper.containsMatchingElement(
        <BorderedCallToAction
          type="sections"
          headingText="Set up your classroom"
          descriptionText="Create a new classroom section to start assigning courses and seeing your student progress."
          buttonText="Create a section"
          onClick={instance.beginEditingSection}
        />
      )
    );
  });

  it('calls beginEditingSection with no arguments when button is clicked', () => {
    const spy = sinon.spy();
    const wrapper = mount(<SetUpSections beginEditingSection={spy} />);
    expect(spy).not.toHaveBeenCalled();

    wrapper.find('button').simulate('click', {fake: 'event'});
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.firstCall.args).toHaveLength(0);
  });

  it('sends start event when button is clicked', () => {
    const wrapper = mount(<SetUpSections beginEditingSection={() => {}} />);
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    wrapper.find('button').simulate('click', {fake: 'event'});
    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    expect(analyticsSpy.firstCall.args).toEqual([
      'Section Setup Started',
      {},
      PLATFORMS.BOTH,
    ]);

    analyticsSpy.restore();
  });
});
