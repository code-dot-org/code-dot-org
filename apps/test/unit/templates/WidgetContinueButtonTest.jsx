import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import * as dialogHelper from '@cdo/apps/code-studio/levels/dialogHelper';
import WidgetContinueButton from '@cdo/apps/templates/WidgetContinueButton';



describe('WidgetContinueButton', () => {
  beforeEach(() => {
    sinon.stub(dialogHelper, 'processResults');
  });

  afterEach(() => {
    dialogHelper.processResults.restore();
  });

  it('calls processResults when clicked', () => {
    const wrapper = shallow(<WidgetContinueButton />);
    expect(dialogHelper.processResults).not.toHaveBeenCalled();
    expect(wrapper.state()).toHaveProperty('submitting', false);

    wrapper.simulate('click');
    expect(dialogHelper.processResults).toHaveBeenCalled();
    expect(wrapper.state()).toHaveProperty('submitting', true);

    // Assume success + redirect, processResults calling callback
    dialogHelper.processResults.firstCall.args[0](true);
  });

  it('resets state if processResults will not redirect', () => {
    const wrapper = shallow(<WidgetContinueButton />);
    expect(wrapper.state()).toHaveProperty('submitting', false);

    wrapper.simulate('click');
    expect(wrapper.state()).toHaveProperty('submitting', true);

    // Assume success + redirect, processResults calling callback
    dialogHelper.processResults.firstCall.args[0](false);
    expect(wrapper.state()).toHaveProperty('submitting', false);
  });
});
