import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Image from '@cdo/apps/tutorialExplorer/image';

describe('Image', () => {
  it('renders with minimum opacity at first', () => {
    const wrapper = shallow(
      <Image style={{}}/>
    );
    expect(wrapper).to.containMatchingElement(
      <img style={{opacity: 0.1}}/>
    );
  });

  it('renders with a transition to full opacity after image loads', () => {
    const wrapper = shallow(
      <Image style={{}}/>
    );
    wrapper.instance().onImageLoad();
    expect(wrapper).to.containMatchingElement(
      <img
        style={{
          opacity: 1,
          transition: 'opacity 200ms ease-in'
        }}
      />
    );
  });
});
