/** @file Test SetupStep component */
import React from 'react';
import {expect} from '../../util/configuredChai';
import {mount} from 'enzyme';
import ValidateStep, {Status} from '@cdo/apps/templates/ValidateStep';

describe('ValidateStep', () => {
  describe('can render every status', () => {
    // This is the lazy 100% coverage test :D
    Object.values(Status).forEach(status => {
      it(status, () => {
        const wrapper = mount(
          <ValidateStep
            stepName={`${status} step name`}
            stepStatus={status}
          >
            Some help content for a {status} step.
          </ValidateStep>
        );
        expect(wrapper).not.to.be.null;
      });
    });
  });

  it('renders nothing when step is hidden', () => {
    const wrapper = mount(
      <ValidateStep
        stepName="Hidden step"
        stepStatus={Status.HIDDEN}
      >
        Some help content.
      </ValidateStep>
    );
    expect(wrapper.html()).to.be.null;
  });

  it('renders help text when step is failed', () => {
    const helpString = 'XYZZY help content';
    const wrapper = mount(
      <ValidateStep
        stepName="Failed step"
        stepStatus={Status.FAILED}
      >
        {helpString}
      </ValidateStep>
    );
    expect(wrapper.text()).to.include(helpString);
  });

  it('does not render help text when step is not failed', () => {
    const helpString = 'XYZZY help content';
    Object.values(Status).forEach(status => {
      if (status === Status.FAILED || status === Status.HIDDEN) {
        return;
      }

      const wrapper = mount(
          <ValidateStep
            stepName={`${status} step`}
            stepStatus={status}
          >
            {helpString}
          </ValidateStep>
      );
      expect(wrapper.text()).not.to.include(helpString);
    });
  });
});
