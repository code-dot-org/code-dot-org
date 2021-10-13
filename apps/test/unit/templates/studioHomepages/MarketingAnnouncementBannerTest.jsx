import React from 'react';
import {Provider} from 'react-redux';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import MarketingAnnouncementBanner from '@cdo/apps/templates/studioHomepages/MarketingAnnouncementBanner';
import * as utils from '@cdo/apps/utils';
import sinon from 'sinon';
import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';

const DEFAULT_PROPS = {
  announcement: {
    id: 'announcement-id',
    image: '/image',
    title: 'Announcement Title',
    body: 'Descriptive information..',
    buttonUrl: '/takemehere',
    buttonText: 'Click me'
  },
  marginBottom: '20px'
};

const store = createStore(combineReducers({isRtl, responsive}));

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};

  // A child of MarketingAnnouncementBanner requires the redux store
  // and we need to mount to be able to test changes based on click interations
  return mount(
    <Provider store={store}>
      <MarketingAnnouncementBanner {...props} />
    </Provider>
  );
};

const isBannerDisplayed = wrapper => {
  return (
    wrapper.find('#marketing-announcement-banner').props().style.display ===
    'block'
  );
};

describe('MarketingAnnouncementBanner', () => {
  it('if banner has not been dismissed, banner is displayed', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns(null);

    const wrapper = setUp();
    expect(isBannerDisplayed(wrapper)).to.be.true;
    utils.tryGetLocalStorage.restore();
  });

  it('if banner has been dismissed, banner is not displayed', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('false');

    const wrapper = setUp();
    expect(isBannerDisplayed(wrapper)).to.be.false;

    utils.tryGetLocalStorage.restore();
  });

  it('when banner is being displayed, clicking button hides banner', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns(null);

    const wrapper = setUp();
    wrapper
      .find('button#marketing-announcement-banner--dismiss')
      .simulate('click');
    expect(isBannerDisplayed(wrapper)).to.be.false;

    utils.tryGetLocalStorage.restore();
  });

  it('when banner is being displayed, clicking sets local storage', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns(null);

    const setLocalStorageSpy = sinon.spy(utils, 'trySetLocalStorage');
    const wrapper = setUp();
    wrapper
      .find('button#marketing-announcement-banner--dismiss')
      .simulate('click');
    expect(setLocalStorageSpy.calledOnce);

    utils.tryGetLocalStorage.restore();
  });
});
