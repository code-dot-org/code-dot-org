import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {UnconnectedSectionProgressToggle} from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';

import {assert} from '../../../util/reconfiguredChai';

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
    expect(wrapper.find('#uitest-standards-toggle').exists()).toBe(true);
  });

  it('sends toggle event when level is clicked', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgressToggle {...DEFAULT_PROPS} />
    );
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    wrapper.instance().onChange();
    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    assert.equal(analyticsSpy.mock.calls[0].firstArg, 'Section Progress Toggled');

    analyticsSpy.mockRestore();
  });

  it('standards toggle does not shows for non-CSF', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgressToggle
        {...DEFAULT_PROPS}
        showStandardsToggle={false}
      />
    );
    expect(wrapper.find('#uitest-standards-toggle').exists()).toBe(false);
  });
});
