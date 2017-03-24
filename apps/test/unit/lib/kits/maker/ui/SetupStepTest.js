/** @file Test SetupStep component */
import React from 'react';
import {expect} from '../../../../../util/configuredChai';
import {mount} from 'enzyme';
import SetupStep, {
  STEP_STATUSES,
  FAILED,
  HIDDEN,
} from '@cdo/apps/lib/kits/maker/ui/SetupStep';

describe('SetupStep', () => {
  describe('can render every status', () => {
    // This is the lazy 100% coverage test :D
    STEP_STATUSES.forEach(status => {
      it(status, () => {
        const wrapper = mount(
          <SetupStep
            stepName={`${status} step name`}
            stepStatus={status}
          >
            Some help content for a {status} step.
          </SetupStep>
        );
        expect(wrapper).not.to.be.null;
      });
    });
  });

  it('throws if given an invalid status type', () => {
    expect(() => {
      mount(
        <SetupStep stepName="Bad step" stepStatus="Something bogus"/>
      );
    }).to.throw(Error);
  });

  it('renders nothing when step is hidden', () => {
    const wrapper = mount(
      <SetupStep
        stepName="Hidden step"
        stepStatus={HIDDEN}
      >
        Some help content.
      </SetupStep>
    );
    expect(wrapper.html()).to.be.null;
  });

  it('renders help text when step is failed', () => {
    const helpString = 'XYZZY help content';
    const wrapper = mount(
      <SetupStep
        stepName="Failed step"
        stepStatus={FAILED}
      >
        {helpString}
      </SetupStep>
    );
    expect(wrapper.text()).to.include(helpString);
  });

  it('does not render help text when step is not failed', () => {
    const helpString = 'XYZZY help content';
    STEP_STATUSES.forEach(status => {
      if (status === FAILED || status === HIDDEN) {
        return;
      }

      const wrapper = mount(
          <SetupStep
            stepName={`${status} step`}
            stepStatus={status}
          >
            {helpString}
          </SetupStep>
      );
      expect(wrapper.text()).not.to.include(helpString);
    });
  });
});
