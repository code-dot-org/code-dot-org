import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import {combineReducers, createStore} from 'redux';
import responsive, {
  setResponsiveSize,
  ResponsiveSize
} from '@cdo/apps/code-studio/responsiveRedux';
import styleConstants from '@cdo/apps/styleConstants';

const store = createStore(combineReducers({responsive}));
store.dispatch(setResponsiveSize(ResponsiveSize.lg));

function wrapperWithProps(short, subheading, description) {
  return mount(
    <Provider store={store}>
      <HeaderBanner
        headingText="Home"
        subHeadingText={subheading}
        description={description}
        short={short}
      />
    </Provider>
  );
}

describe('HeaderBanner', () => {
  it('renders a short HeaderBanner without a subheading or description', () => {
    const wrapper = wrapperWithProps(true);
    expect(
      wrapper.containsMatchingElement(
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
      )
    );
  });

  it('renders a short HeaderBanner with a subheading', () => {
    const wrapper = wrapperWithProps(
      true,
      'This is where you can find useful information.'
    );
    expect(
      wrapper.containsMatchingElement(
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
      )
    );
  });

  it('renders an extended HeaderBanner with a subheading and description', () => {
    const wrapper = wrapperWithProps(
      false,
      'This is where you can find useful information.',
      'Everything on the page is customized to you and easy to find.'
    );
    expect(
      wrapper.containsMatchingElement(
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
      )
    );
  });
});
