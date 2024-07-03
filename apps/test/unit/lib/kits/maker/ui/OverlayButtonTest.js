/** @file Test maker overlay button */
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import OverlayButton from '@cdo/apps/lib/kits/maker/ui/OverlayButton';



describe('OverlayButton', () => {
  it('renders a button', () => {
    const wrapper = mount(<OverlayButton text="Click me" onClick={() => {}} />);
    expect(wrapper.find('button').length).toBeGreaterThan(0);
  });

  it('renders the given text inside the button', () => {
    const wrapper = mount(<OverlayButton text="xyzzy" onClick={() => {}} />);
    expect(wrapper.text()).toContain('xyzzy');
  });

  it('puts a provided className on the button', () => {
    const wrapper = mount(
      <OverlayButton className="guncho" text="xyzzy" onClick={() => {}} />
    );
    expect(wrapper).to.have.className('guncho');
  });

  it('calls onClick when clicked', () => {
    const spy = sinon.spy();
    const wrapper = mount(<OverlayButton text="OK" onClick={spy} />);
    expect(spy).not.toHaveBeenCalled();
    wrapper.find('button').simulate('click');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
