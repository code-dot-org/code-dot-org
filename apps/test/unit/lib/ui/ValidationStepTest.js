/** @file Test SetupStep component */
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';

describe('ValidationStep', () => {
  describe('can render every status', () => {
    // This is the lazy 100% coverage test :D
    Object.values(Status).forEach(status => {
      it(status, () => {
        const wrapper = mount(
          <ValidationStep stepName={`${status} step name`} stepStatus={status}>
            Some help content for a {status} step.
          </ValidationStep>
        );
        expect(wrapper).not.toBeNull();
      });
    });
  });

  it('renders help text when step is failed or alert', () => {
    const helpString = 'XYZZY help content';
    let wrapper = mount(
      <ValidationStep stepName="Failed step" stepStatus={Status.FAILED}>
        {helpString}
      </ValidationStep>
    );
    expect(wrapper.text()).toContain(helpString);
    wrapper = mount(
      <ValidationStep stepName="Alert step" stepStatus={Status.ALERT}>
        {helpString}
      </ValidationStep>
    );
    expect(wrapper.text()).toContain(helpString);
  });

  it('does not render help text when step is not failed or alert', () => {
    const helpString = 'XYZZY help content';
    Object.values(Status).forEach(status => {
      if (status === Status.FAILED || status === Status.ALERT) {
        return;
      }

      const wrapper = mount(
        <ValidationStep stepName={`${status} step`} stepStatus={status}>
          {helpString}
        </ValidationStep>
      );
      expect(wrapper.text()).not.toContain(helpString);
    });
  });
});
