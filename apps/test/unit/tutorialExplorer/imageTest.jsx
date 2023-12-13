import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../util/reconfiguredChai';
import Image from '@cdo/apps/tutorialExplorer/image';

describe('Image', () => {
  it('renders with minimum opacity at first', () => {
    const wrapper = shallow(<Image style={{}} />, {
      disableLifecycleMethods: true,
    });
    assert(
      wrapper.containsMatchingElement(<img style={{opacity: 0.1}} alt="" />)
    );
  });

  it('renders with a transition to full opacity after image loads', () => {
    const wrapper = shallow(<Image style={{}} />, {
      disableLifecycleMethods: true,
    });
    wrapper.instance().onImageLoad();
    assert(
      wrapper.containsMatchingElement(
        <img
          style={{
            opacity: 1,
            transition: 'opacity 200ms ease-in',
          }}
          alt=""
        />
      )
    );
  });
});
