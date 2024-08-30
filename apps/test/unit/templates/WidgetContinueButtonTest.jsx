import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import * as dialogHelper from '@cdo/apps/code-studio/levels/dialogHelper';
import WidgetContinueButton from '@cdo/apps/templates/WidgetContinueButton';

describe('WidgetContinueButton', () => {
  beforeEach(() => {
    jest.spyOn(dialogHelper, 'processResults').mockClear().mockImplementation();
  });

  afterEach(() => {
    dialogHelper.processResults.mockRestore();
  });

  it('calls processResults when clicked', () => {
    const wrapper = shallow(<WidgetContinueButton />);
    expect(dialogHelper.processResults).not.toHaveBeenCalled();
    expect(wrapper.state()).toHaveProperty('submitting', false);

    wrapper.simulate('click');
    expect(dialogHelper.processResults).toHaveBeenCalled();
    expect(wrapper.state()).toHaveProperty('submitting', true);

    // Assume success + redirect, processResults calling callback
    dialogHelper.processResults.mock.calls[0][0](true);
  });

  it('resets state if processResults will not redirect', () => {
    const wrapper = shallow(<WidgetContinueButton />);
    expect(wrapper.state()).toHaveProperty('submitting', false);

    wrapper.simulate('click');
    expect(wrapper.state()).toHaveProperty('submitting', true);

    // Assume success + redirect, processResults calling callback
    dialogHelper.processResults.mock.calls[0][0](false);
    expect(wrapper.state()).toHaveProperty('submitting', false);
  });
});
