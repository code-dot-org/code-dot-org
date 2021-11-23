import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedViewAsToggle as ViewAsToggle} from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

describe('ViewAsToggle', () => {
  it('calls changeViewType when ToggleGroup changes', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <ViewAsToggle viewAs={ViewType.Student} changeViewType={spy} />
    );
    expect(spy).not.to.have.been.called;

    wrapper.find('Connect(ToggleGroup)').prop('onChange')(ViewType.Teacher);
    expect(spy).to.have.been.calledOnce.and.calledWith(ViewType.Teacher);
  });
});
