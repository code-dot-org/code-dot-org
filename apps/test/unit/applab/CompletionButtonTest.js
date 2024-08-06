import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedCompletionButton as CompletionButton} from '@cdo/apps/templates/CompletionButton';

describe('CompletionButton', () => {
  it('non-project level, can submit, havent', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={true}
        isSubmitted={false}
      />
    );
    const button = completionButton.find('button');
    expect(button).toHaveLength(1);
    expect(button.props().id).toBe('submitButton');
    expect(button.text()).toBe('Submit');
  });

  it('non-project level, can submit, have', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={true}
        isSubmitted={true}
      />
    );
    const button = completionButton.find('button');
    expect(button).toHaveLength(1);
    expect(button.props().id).toBe('unsubmitButton');
    expect(button.text()).toBe('Unsubmit');
  });

  // It is possible for users to get into a state where the level is submitted
  // but not submittable. Make sure we show the Unsubmit button in this case.
  it('non-project level, is not submittable, but is submitted', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={false}
        isSubmitted={true}
      />
    );
    const button = completionButton.find('button');
    expect(button).toHaveLength(1);
    expect(button.props().id).toBe('unsubmitButton');
    expect(button.text()).toBe('Unsubmit');
  });

  it('non-project level, cant submit', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={false}
        isSubmittable={false}
        isSubmitted={false}
      />
    );
    const button = completionButton.find('button');
    expect(button).toHaveLength(1);
    expect(button.props().id).toBe('finishButton');
    expect(button.text()).toBe('Finish');
  });

  it('project level (cant submit)', () => {
    const completionButton = mount(
      <CompletionButton
        isProjectLevel={true}
        isSubmittable={false}
        isSubmitted={false}
      />
    );
    const button = completionButton.find('button');
    expect(button).toHaveLength(0);
  });
});
