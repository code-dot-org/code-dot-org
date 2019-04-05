import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import Image from '@cdo/apps/tutorialExplorer/image';

describe('Image', () => {
  it('renders with minimum opacity at first', () => {
    const wrapper = shallow(<Image style={{}} />);
    expect(wrapper.containsMatchingElement(<img style={{opacity: 0.1}} />)).to
      .be.ok;
  });

  it('renders with a transition to full opacity after image loads', () => {
    const wrapper = shallow(<Image style={{}} />);
    wrapper.instance().onImageLoad();
    expect(
      wrapper.containsMatchingElement(
        <img
          style={{
            opacity: 1,
            transition: 'opacity 200ms ease-in'
          }}
        />
      )
    ).to.be.ok;
  });
});
