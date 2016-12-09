import {expect} from '../../util/configuredChai';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import WireframeButtons, {
    appendUrl
} from '@cdo/apps/templates/WireframeButtons';

describe('WireframeButtons.appendUrl', function () {

  it('typical url', function () {
    console.log(appendUrl);
    expect(appendUrl('http://url', '/view')).to.equal('http://url/view');
  });

  it('with ending slashes', function () {
    expect(appendUrl('http://url//', '/view')).to.equal('http://url/view');
  });

  it('with query string', function () {
    expect(appendUrl('http://url?query', '/view')).to.equal('http://url/view?query');
  });

  it('with hash', function () {
    expect(appendUrl('http://url#hash', '/view')).to.equal('http://url/view');
  });

  it('with ending slashes, query, and hash', function () {
    expect(appendUrl('http://url/?query#hash', '/view')).to.equal('http://url/view?query');
  });
 });
