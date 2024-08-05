import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Image from '@cdo/apps/tutorialExplorer/image';

describe('Image', () => {
  it('renders with minimum opacity at first', () => {
    const wrapper = shallow(<Image style={{}} />, {
      disableLifecycleMethods: true,
    });
    expect(
      // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
      // Verify or update this alt-text as necessary
      wrapper.containsMatchingElement(<img style={{opacity: 0.1}} alt="" />)
    ).toBeTruthy();
  });

  it('renders with a transition to full opacity after image loads', () => {
    const wrapper = shallow(<Image style={{}} />, {
      disableLifecycleMethods: true,
    });
    wrapper.instance().onImageLoad();
    expect(
      wrapper.containsMatchingElement(
        // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
        // Verify or update this alt-text as necessary
        <img
          style={{
            opacity: 1,
            transition: 'opacity 200ms ease-in',
          }}
          alt=""
        />
      )
    ).toBeTruthy();
  });
});
