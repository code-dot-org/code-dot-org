import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/deprecatedChai';
import Alert from '@cdo/apps/templates/alert';

describe('Alert', () => {
  it('renders any children', () => {
    const wrapper = shallow(
      <Alert type="error" onClose={() => {}}>
        <div>
          <div>Arbitrary</div>
          <a href="#">Children</a>
          <i>Are Allowed</i>
        </div>
      </Alert>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>Arbitrary</div>
        <a href="#">Children</a>
        <i>Are Allowed</i>
      </div>
    );
  });

  it('can be an error or a warning', () => {
    const error = shallow(
      <Alert type="error" onClose={() => {}}>
        <span>This is an error.</span>
      </Alert>
    );
    expect(error.find('div > div').props().style.backgroundColor).to.equal(
      '#f2dede'
    );

    const warning = shallow(
      <Alert type="warning" onClose={() => {}}>
        <span>This is a warning.</span>
      </Alert>
    );
    expect(warning.find('div > div').props().style.backgroundColor).to.equal(
      '#fcf8e3'
    );
  });

  it('calls onClose callback when close button is clicked', () => {
    const callback = sinon.spy();
    const error = shallow(
      <Alert type="error" onClose={callback}>
        <span>This is an error.</span>
      </Alert>
    );
    expect(callback).not.to.have.been.called;
    error.find('button').simulate('click');
    expect(callback).to.have.been.calledOnce;
  });
});
