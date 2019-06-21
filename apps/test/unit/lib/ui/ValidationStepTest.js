/** @file Test SetupStep component */
import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
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
        expect(wrapper).not.to.be.null;
      });
    });
  });

  it('renders help text when step is failed', () => {
    const helpString = 'XYZZY help content';
    const wrapper = mount(
      <ValidationStep stepName="Failed step" stepStatus={Status.FAILED}>
        {helpString}
      </ValidationStep>
    );
    expect(wrapper.text()).to.include(helpString);
  });

  it('does not render help text when step is not failed', () => {
    const helpString = 'XYZZY help content';
    Object.values(Status).forEach(status => {
      if (status === Status.FAILED) {
        return;
      }

      const wrapper = mount(
        <ValidationStep stepName={`${status} step`} stepStatus={status}>
          {helpString}
        </ValidationStep>
      );
      expect(wrapper.text()).not.to.include(helpString);
    });
  });
});
