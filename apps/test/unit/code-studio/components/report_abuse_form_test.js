import { assert } from '../../../util/configuredChai';
import {getChannelIdFromUrl} from '@cdo/apps/code-studio/components/report_abuse_form';

describe('report_abuse_form', () => {
  it('getChannelIdFromUrl returns the channel id for codeprojects', () => {
    assert.equal(getChannelIdFromUrl('https://codeprojects.org/123abc/'), "123abc");
    assert.equal(getChannelIdFromUrl('http://localhost.codeprojects.org:3000/abc123/'), "abc123");
  });

  it('getChannelIdFromUrl returns the channel id for studio projects', () => {
    assert.equal(getChannelIdFromUrl('https://studio.code.org/projects/gamelab/123abc'), "123abc");
    assert.equal(getChannelIdFromUrl('https://studio.code.org/projects/applab/123abc'), "123abc");
    assert.equal(getChannelIdFromUrl('https://studio.code.org/projects/playlab/123abc/'), "123abc");
    assert.equal(getChannelIdFromUrl('http://localhost-studio.code.org:3000/projects/weblab/123abc/edit'), "123abc");
  });
});
