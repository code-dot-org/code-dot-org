import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedRetryProjectSaveDialog as RetryProjectSaveDialog} from '@cdo/apps/code-studio/components/header/RetryProjectSaveDialog';
import {projectUpdatedStatuses as statuses} from '@cdo/apps/code-studio/projectRedux';

const errorTitle = 'Error saving your project';

describe('RetryProjectSaveDialog', () => {
  it('is hidden by default', () => {
    const wrapper = mount(
      <RetryProjectSaveDialog
        projectUpdatedStatus={statuses.saved}
        onTryAgain={jest.fn()}
      />
    );
    expect(wrapper.text()).not.toContain(errorTitle);
  });

  it('is visible and clickable when open', () => {
    const tryAgain = jest.fn();
    const wrapper = mount(
      <RetryProjectSaveDialog
        projectUpdatedStatus={statuses.error}
        isOpen={true}
        onTryAgain={tryAgain}
      />
    );
    expect(wrapper.text()).toContain(errorTitle);
    const button = wrapper.find('Button').at(0);
    expect(button.text()).toBe('Try again');

    expect(tryAgain).not.toHaveBeenCalled();
    button.simulate('click');
    expect(tryAgain).toHaveBeenCalled();
  });

  it('is not clickable when save is pending', () => {
    const tryAgain = jest.fn();
    const wrapper = mount(
      <RetryProjectSaveDialog
        projectUpdatedStatus={statuses.saving}
        isOpen={true}
        onTryAgain={tryAgain}
      />
    );
    expect(wrapper.text()).toContain(errorTitle);
    const button = wrapper.find('Button').at(0);
    expect(button.text()).toContain('saving');

    button.simulate('click');
    expect(tryAgain).not.toHaveBeenCalled();
  });
});
