import {shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import * as dialogHelper from '@cdo/apps/code-studio/levels/dialogHelper';
import WidgetContinueButton from '@cdo/apps/templates/WidgetContinueButton';

import {expect} from '../../util/deprecatedChai';

describe('WidgetContinueButton', () => {
  beforeEach(() => {
    sinon.stub(dialogHelper, 'processResults');
  });

  afterEach(() => {
    dialogHelper.processResults.restore();
  });

  it('calls processResults when clicked', () => {
    const wrapper = shallow(<WidgetContinueButton />);
    expect(dialogHelper.processResults).not.to.have.been.called;
    expect(wrapper).to.have.state('submitting', false);

    wrapper.simulate('click');
    expect(dialogHelper.processResults).to.have.been.called;
    expect(wrapper).to.have.state('submitting', true);

    // Assume success + redirect, processResults calling callback
    dialogHelper.processResults.firstCall.args[0](true);
  });

  it('resets state if processResults will not redirect', () => {
    const wrapper = shallow(<WidgetContinueButton />);
    expect(wrapper).to.have.state('submitting', false);

    wrapper.simulate('click');
    expect(wrapper).to.have.state('submitting', true);

    // Assume success + redirect, processResults calling callback
    dialogHelper.processResults.firstCall.args[0](false);
    expect(wrapper).to.have.state('submitting', false);
  });
});
