import React from 'react';
import sinon from 'sinon';
import {mount} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';

import {projectUpdatedStatuses as statuses} from '@cdo/apps/code-studio/headerRedux';

import {UnconnectedRetryProjectSaveDialog as RetryProjectSaveDialog} from '@cdo/apps/code-studio/components/header/RetryProjectSaveDialog';

const errorTitle = 'Error saving your project';

describe('RetryProjectSaveDialog', () => {
  it('is hidden by default', () => {
    const wrapper = mount(
      <RetryProjectSaveDialog
        projectUpdatedStatus={statuses.saved}
        onTryAgain={sinon.spy()}
      />
    );
    expect(wrapper.text()).not.to.include(errorTitle);
  });

  it('is visible and clickable when open', () => {
    const tryAgain = sinon.spy();
    const wrapper = mount(
      <RetryProjectSaveDialog
        projectUpdatedStatus={statuses.error}
        isOpen={true}
        onTryAgain={tryAgain}
      />
    );
    expect(wrapper.text()).to.include(errorTitle);
    const button = wrapper.find('Button').at(0);
    expect(button.text()).to.equal('Try again');

    expect(tryAgain).not.to.have.been.called;
    button.simulate('click');
    expect(tryAgain).to.have.been.called;
  });

  it('is not clickable when save is pending', () => {
    const tryAgain = sinon.spy();
    const wrapper = mount(
      <RetryProjectSaveDialog
        projectUpdatedStatus={statuses.saving}
        isOpen={true}
        onTryAgain={tryAgain}
      />
    );
    expect(wrapper.text()).to.include(errorTitle);
    const button = wrapper.find('Button').at(0);
    expect(button.text()).to.contain('saving');

    button.simulate('click');
    expect(tryAgain).not.to.have.been.called;
  });
});
