import React from 'react';
import {Provider} from 'react-redux';
import {expect} from '../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
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

const setUpShallow = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<MarketingAnnouncementBanner {...props} />);
};

const store = createStore(combineReducers({isRtl, responsive}));

before(() => {
  // Avoid `attachTo: document.body` Warning
  const div = document.createElement('div');
  div.setAttribute('id', 'container');
  document.body.appendChild(div);
});

after(() => {
  const div = document.getElementById('container');
  if (div) {
    document.body.removeChild(div);
  }
});

const setUpMount = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};

  // A child of MarketingAnnouncementBanner requires the redux store
  // and we need to mount to be able to test changes based on click interations
  return mount(
    <Provider store={store}>
      <MarketingAnnouncementBanner {...props} />
    </Provider>,
    {attachTo: document.getElementById('container')}
  );
};

const isBannerDisplayed = wrapper => {
  return wrapper.find('#homepage-banner').props().style.display === 'block';
};

describe('MarketingAnnouncementBanner', () => {
  it('if banner has not been dismissed, banner is displayed', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns(null);

    const wrapper = setUpShallow();
    expect(isBannerDisplayed(wrapper)).to.be.true;
    utils.tryGetLocalStorage.restore();
  });

  it('if banner has been dismissed, banner is not displayed', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns('false');

    const wrapper = setUpMount();
    expect(isBannerDisplayed(wrapper)).to.be.false;

    utils.tryGetLocalStorage.restore();
  });

  it('when banner is being displayed, clicking button hides banner', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns(null);

    const wrapper = setUpShallow();
    wrapper.find('Button').simulate('click');
    expect(isBannerDisplayed(wrapper)).to.be.false;

    utils.tryGetLocalStorage.restore();
  });

  it('when banner is being displayed, clicking sets local storage', () => {
    sinon.stub(utils, 'tryGetLocalStorage').returns(null);

    const setLocalStorageSpy = sinon.spy(utils, 'trySetLocalStorage');
    const wrapper = setUpShallow();
    wrapper.find('Button').simulate('click');
    expect(setLocalStorageSpy.calledOnce);

    utils.tryGetLocalStorage.restore();
  });
});
