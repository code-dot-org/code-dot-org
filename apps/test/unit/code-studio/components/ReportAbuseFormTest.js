import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import {getChannelIdFromUrl} from '@cdo/apps/reportAbuse';
import ReportAbuseForm from '@cdo/apps/code-studio/components/ReportAbuseForm';

describe('ReportAbuseForm', () => {
  it('getChannelIdFromUrl returns the channel id for codeprojects', () => {
    assert.equal(
      getChannelIdFromUrl('https://codeprojects.org/123abc/'),
      '123abc'
    );
    assert.equal(
      getChannelIdFromUrl('http://localhost.codeprojects.org:3000/abc123/'),
      'abc123'
    );
    assert.equal(
      getChannelIdFromUrl('https://codeprojects.org/projects/weblab/123abc/'),
      '123abc'
    );
    assert.equal(
      getChannelIdFromUrl(
        'http://localhost.codeprojects.org:3000/projects/weblab/abc123/'
      ),
      'abc123'
    );
  });

  it('getChannelIdFromUrl returns the channel id for studio projects', () => {
    assert.equal(
      getChannelIdFromUrl('https://studio.code.org/projects/gamelab/123abc'),
      '123abc'
    );
    assert.equal(
      getChannelIdFromUrl('https://studio.code.org/projects/applab/123abc'),
      '123abc'
    );
    assert.equal(
      getChannelIdFromUrl('https://studio.code.org/projects/playlab/123abc/'),
      '123abc'
    );
    assert.equal(
      getChannelIdFromUrl(
        'http://localhost-studio.code.org:3000/projects/weblab/123abc/edit'
      ),
      '123abc'
    );
  });

  it('getChannelIdFromUrl returns the channel id for weblab projects', () => {
    assert.equal(
      getChannelIdFromUrl(
        'https://studio.code.org/report_abuse?channelId=123abc'
      ),
      '123abc'
    );
    assert.equal(
      getChannelIdFromUrl(
        'http://localhost-studio.code.org:3000/report_abuse?channelId=123abc'
      ),
      '123abc'
    );
  });

  it('renders a captcha when required', () => {
    const args = {
      abuseUrl: 'test.url',
      requireCaptcha: true,
    };
    const wrapper = shallow(<ReportAbuseForm {...args} />);

    assert.equal(wrapper.find('div.g-recaptcha').length, 1);
  });

  it('does not render a captcha when not required', () => {
    const args = {
      abuseUrl: 'test.url',
      requireCaptcha: false,
    };
    const wrapper = shallow(<ReportAbuseForm {...args} />);

    assert.equal(wrapper.find('div.g-recaptcha').length, 0);
  });
});
