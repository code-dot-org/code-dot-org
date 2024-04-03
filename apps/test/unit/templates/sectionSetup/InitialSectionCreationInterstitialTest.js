import {mount} from 'enzyme';
import React from 'react';
import {Provider} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import InitialSectionCreationInterstitial from '@cdo/apps/templates/sectionSetup/InitialSectionCreationInterstitial';

import {expect} from '../../../util/reconfiguredChai';

describe('InitialSectionCreationInterstitial', () => {
  it('logs an Amplitude event for when the dialog is abandoned', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    const wrapper = mount(
      <Provider store={getStore()}>
        <InitialSectionCreationInterstitial />
      </Provider>
    );
    wrapper.find('button#uitest-abandon-section-creation').simulate('click');

    expect(analyticsSpy).to.have.been.calledOnce;
    expect(analyticsSpy.mock.calls[0]).to.deep.eq([
      EVENTS.ABANDON_SECTION_SETUP_SIGN_IN_EVENT,
    ]);

    analyticsSpy.mockRestore();
  });

  it('logs an Amplitude event for when the user selects to create a section', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    const wrapper = mount(
      <Provider store={getStore()}>
        <InitialSectionCreationInterstitial />
      </Provider>
    );
    wrapper.find('button#uitest-accept-section-creation').simulate('click');

    expect(analyticsSpy).to.have.been.calledOnce;
    expect(analyticsSpy.mock.calls[0]).to.deep.eq([
      EVENTS.SECTION_SETUP_SIGN_IN_EVENT,
    ]);

    analyticsSpy.mockRestore();
  });
});
