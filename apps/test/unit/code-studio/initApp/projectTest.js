import {expect} from '../../../util/configuredChai';
import React from 'react';
import sinon from 'sinon';
let project = require('@cdo/apps/code-studio/initApp/project');

describe('project.getProjectUrl', function () {

  let stubUrl;
  let url;

  beforeEach(function () {
    stubUrl = sinon.stub(project, 'getUrl').callsFake(() => url);
  });

  afterEach(function () {
    stubUrl.restore();
  });

  it('typical url', function () {
    url = 'http://url';
    expect(project.getProjectUrl('/view')).to.equal('http://url/view');
  });

  it('with ending slashes', function () {
    url = 'http://url//';
    expect(project.getProjectUrl('/view')).to.equal('http://url/view');
  });

  it('with query string', function () {
    url = 'http://url?query';
    expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
  });

  it('with hash', function () {
    url = 'http://url#hash';
    expect(project.getProjectUrl('/view')).to.equal('http://url/view');
  });

  it('with ending slashes, query, and hash', function () {
    url = 'http://url/?query#hash';
    expect(project.getProjectUrl('/view')).to.equal('http://url/view?query');
  });
});
