import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import MarketingAnnouncementBanner from '@cdo/apps/templates/studioHomepages/MarketingAnnouncementBanner';
import * as utils from '@cdo/apps/utils';



const DEFAULT_PROPS = {
  announcement: {
    id: 'announcement-id',
    image: '/image',
    title: 'Announcement Title',
    body: 'Descriptive information..',
    buttonUrl: '/takemehere',
    buttonText: 'Click me',
    buttonId: 'announcement-button',
  },
  marginBottom: '20px',
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
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue(null);

    const wrapper = setUp();
    expect(isBannerDisplayed(wrapper)).toBe(true);
    utils.tryGetLocalStorage.mockRestore();
  });

  it('if banner has been dismissed, banner is not displayed', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue('false');

    const wrapper = setUp();
    expect(isBannerDisplayed(wrapper)).toBe(false);

    utils.tryGetLocalStorage.mockRestore();
  });

  it('when banner is being displayed, clicking button hides banner', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue(null);

    const wrapper = setUp();
    wrapper
      .find('button#marketing-announcement-banner--dismiss')
      .simulate('click');
    expect(isBannerDisplayed(wrapper)).toBe(false);

    utils.tryGetLocalStorage.mockRestore();
  });

  it('when banner is being displayed, clicking sets local storage', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue(null);

    const setLocalStorageSpy = jest.spyOn(utils, 'trySetLocalStorage').mockClear();
    const wrapper = setUp();
    wrapper
      .find('button#marketing-announcement-banner--dismiss')
      .simulate('click');
    expect(setLocalStorageSpy.calledOnce);

    utils.tryGetLocalStorage.mockRestore();
  });

  it('sends event to firehose when banner is dismissed', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue(null);
    const firehoseSpy = jest.spyOn(firehoseClient, 'putRecord').mockClear();

    const wrapper = setUp();
    wrapper
      .find('button#marketing-announcement-banner--dismiss')
      .simulate('click');
    expect(firehoseSpy.calledOnce);
    firehoseSpy.calledWith({
      study: 'teacher_signedin_homepage',
      study_group: 'homepage_banner',
      event: 'close_button_clicked',
      data_json: JSON.stringify({
        banner_title: 'Announcement Title',
      }),
    });

    utils.tryGetLocalStorage.mockRestore();
    firehoseSpy.mockRestore();
  });

  it('sends event to firehose when button is clicked', () => {
    jest.spyOn(utils, 'tryGetLocalStorage').mockClear().mockReturnValue(null);
    const firehoseSpy = jest.spyOn(firehoseClient, 'putRecord').mockClear();

    const wrapper = setUp();
    wrapper.find('a#announcement-button').simulate('click');
    expect(firehoseSpy.calledOnce);
    firehoseSpy.calledWith({
      study: 'teacher_signedin_homepage',
      study_group: 'homepage_banner',
      event: 'cta_button_clicked',
      data_json: JSON.stringify({
        banner_title: 'Announcement Title',
      }),
    });

    utils.tryGetLocalStorage.mockRestore();
    firehoseSpy.mockRestore();
  });
});
