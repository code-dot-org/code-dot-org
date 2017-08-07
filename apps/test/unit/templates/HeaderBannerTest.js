import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

describe('HeaderBanner', () => {
  it('renders a short HeaderBanner without a subheading or description', () => {
    const wrapper = shallow(
      <HeaderBanner
        headingText="Home"
        short={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div style={{height: 140}}>
        <div>
          Home
        </div>
        <div>
          <span>
            &nbsp;
          </span>
        </div>
      </div>
    );
  });

  it('renders a short HeaderBanner with a subheading', () => {
    const wrapper = shallow(
      <HeaderBanner
        headingText="Home"
        subHeadingText="This is where you can find useful information."
        short={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div style={{height: 140}}>
        <div>
          Home
        </div>
        <div>
          This is where you can find useful information.
        </div>
      </div>
    );
  });

  it('renders an extended HeaderBanner with a subheading and description', () => {
    const wrapper = shallow(
      <HeaderBanner
        headingText="Home"
        subHeadingText="This is where you can find useful information."
        description="Everything on the page is customized to you and easy to find."
        short={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div style={{height: 260}}>
        <div>
          Home
        </div>
        <div>
          This is where you can find useful information.
        </div>
        <div>
          Everything on the page is customized to you and easy to find.
        </div>
      </div>
    );
  });
});
