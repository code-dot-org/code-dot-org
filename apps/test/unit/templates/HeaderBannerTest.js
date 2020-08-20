import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import {combineReducers, createStore} from 'redux';
import responsive, {
  setResponsiveSize,
  ResponsiveSize
} from '@cdo/apps/code-studio/responsiveRedux';
import styleConstants from '@cdo/apps/styleConstants';

describe('HeaderBanner', () => {
  const store = createStore(combineReducers({responsive}));
  store.dispatch(setResponsiveSize(ResponsiveSize.lg));

  it('renders a short HeaderBanner without a subheading or description', () => {
    const wrapper = shallow(<HeaderBanner headingText="Home" short={true} />, {
      context: {store}
    });
    expect(wrapper.dive()).to.containMatchingElement(
      <div>
        <div
          style={{
            minHeight: 140,
            maxWidth: styleConstants['content-width']
          }}
        >
          <div>
            <div>Home</div>
          </div>
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
      />,
      {context: {store}}
    );
    expect(wrapper.dive()).to.containMatchingElement(
      <div>
        <div
          style={{
            minHeight: 140,
            maxWidth: styleConstants['content-width']
          }}
        >
          <div>
            <div>Home</div>
            <div>This is where you can find useful information.</div>
          </div>
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
      />,
      {context: {store}}
    );
    expect(wrapper.dive()).to.containMatchingElement(
      <div>
        <div
          style={{
            minHeight: 260,
            maxWidth: styleConstants['content-width']
          }}
        >
          <div>
            <div>Home</div>
            <div>This is where you can find useful information.</div>
            <div>
              Everything on the page is customized to you and easy to find.
            </div>
          </div>
        </div>
      </div>
    );
  });
});
