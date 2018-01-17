import {expect} from '../../../util/configuredChai';
import sinon from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import UiTip from '@cdo/apps/templates/studioHomepages/UiTip';

describe('UiTip', () => {
  it('renders at the specified position', () => {
    const wrapper = shallow(
      <UiTip
        position={{
          left: 10,
          top: 20,
        }}
        text="Foobar"
        arrowDirection="up"
        closeClicked={() => {}}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div
          className="arrow_box_up"
          style={{
            left: 10,
            top: 20,
          }}
        >
          <div>
            <i className="fa fa-times"/>
          </div>
          <div>
            {"Foobar"}
          </div>
        </div>
      </div>
    );
  });

  it('calls close callback when clicked', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <UiTip
        index={42}
        closeClicked={spy}
      />
    );
    expect(spy).not.to.have.been.called;

    wrapper.children().first().simulate('click');
    expect(spy).to.have.been.calledOnce.and.calledWith(42);
  });
});
