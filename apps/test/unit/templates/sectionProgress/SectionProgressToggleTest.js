import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {UnconnectedSectionProgressToggle} from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';

import {expect, assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('SectionProgressToggle', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      showStandardsToggle: true,
      setCurrentView: () => {},
      sectionId: 1,
      currentView: ViewType.STANDARDS,
    };
  });

  it('standards toggle shows for CSF', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgressToggle {...DEFAULT_PROPS} />
    );
    expect(wrapper.find('#uitest-standards-toggle').exists()).to.be.true;
  });

  it('sends toggle event when level is clicked', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgressToggle {...DEFAULT_PROPS} />
    );
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    wrapper.instance().onChange();
    expect(analyticsSpy).to.be.calledOnce;
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Section Progress Toggled');

    analyticsSpy.restore();
  });

  it('standards toggle does not shows for non-CSF', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgressToggle
        {...DEFAULT_PROPS}
        showStandardsToggle={false}
      />
    );
    expect(wrapper.find('#uitest-standards-toggle').exists()).to.be.false;
  });
});
