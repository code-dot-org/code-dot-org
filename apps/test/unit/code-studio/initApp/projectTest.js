import {expect} from '../../../util/configuredChai';
import React from 'react';
import sinon from 'sinon';
import project from '@cdo/apps/code-studio/initApp/project';
import {files as filesApi} from '@cdo/apps/clientApi';
import header from '@cdo/apps/code-studio/header';

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

describe('project.saveThumbnail', () => {
  const STUB_CHANNEL_ID = 'STUB-CHANNEL-ID';
  let updateTimestamp;

  beforeEach(() => {
    sinon.stub(header, 'updateTimestamp');
    sinon.stub(filesApi, 'putFile');

    const projectData = {
      id: STUB_CHANNEL_ID,
      isOwner: true
    };
    project.updateCurrentData_(null, projectData);
  });

  afterEach(() => {
    project.updateCurrentData_(null, undefined);

    filesApi.putFile.restore();
    header.updateTimestamp.restore();
  });

  it('calls filesApi.putFile with correct parameters', () => {
    const blob = 'stub-binary-data';

    project.saveThumbnail(blob);

    expect(filesApi.putFile).to.have.been.calledOnce;
    const call = filesApi.putFile.getCall(0);
    expect(call.args[0]).to.equal('.metadata/thumbnail.png');
    expect(call.args[1]).to.equal(blob);
  });
});
