import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ReportAbuseForm from '@cdo/apps/code-studio/components/ReportAbuseForm';
import {getChannelIdFromUrl} from '@cdo/apps/reportAbuse';

describe('ReportAbuseForm', () => {
  it('getChannelIdFromUrl returns the channel id for codeprojects', () => {
    expect(getChannelIdFromUrl('https://codeprojects.org/123abc/')).toEqual(
      '123abc'
    );
    expect(
      getChannelIdFromUrl('http://codeprojects.org.localhost:3000/abc123/')
    ).toEqual('abc123');
    expect(
      getChannelIdFromUrl('https://codeprojects.org/projects/weblab/123abc/')
    ).toEqual('123abc');
    expect(
      getChannelIdFromUrl(
        'http://codeprojects.org.localhost:3000/projects/weblab/abc123/'
      )
    ).toEqual('abc123');
  });

  it('getChannelIdFromUrl returns the channel id for studio projects', () => {
    expect(
      getChannelIdFromUrl('https://studio.code.org/projects/gamelab/123abc')
    ).toEqual('123abc');
    expect(
      getChannelIdFromUrl('https://studio.code.org/projects/applab/123abc')
    ).toEqual('123abc');
    expect(
      getChannelIdFromUrl('https://studio.code.org/projects/playlab/123abc/')
    ).toEqual('123abc');
    expect(
      getChannelIdFromUrl(
        'http://studio.code.org.localhost:3000/projects/weblab/123abc/edit'
      )
    ).toEqual('123abc');
  });

  it('getChannelIdFromUrl returns the channel id for weblab projects', () => {
    expect(
      getChannelIdFromUrl(
        'https://studio.code.org/report_abuse?channelId=123abc'
      )
    ).toEqual('123abc');
    expect(
      getChannelIdFromUrl(
        'http://studio.code.org.localhost:3000/report_abuse?channelId=123abc'
      )
    ).toEqual('123abc');
  });

  it('renders a captcha when required', () => {
    const args = {
      abuseUrl: 'test.url',
      requireCaptcha: true,
    };
    const wrapper = shallow(<ReportAbuseForm {...args} />);

    expect(wrapper.find('div.g-recaptcha').length).toEqual(1);
  });

  it('does not render a captcha when not required', () => {
    const args = {
      abuseUrl: 'test.url',
      requireCaptcha: false,
    };
    const wrapper = shallow(<ReportAbuseForm {...args} />);

    expect(wrapper.find('div.g-recaptcha').length).toEqual(0);
  });
});
