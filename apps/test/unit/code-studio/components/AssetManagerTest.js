import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import AssetManager from '@cdo/apps/code-studio/components/AssetManager';

const DEFAULT_PROPS = {
  uploadsEnabled: true
};

describe('AssetManager', () => {
  var xhr, requests;

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    xhr.restore();
  });

  describe('componentDidMount', () => {
    it('gets starter assets if levelName is present', () => {
      const levelName = 'my level name';
      shallow(<AssetManager {...DEFAULT_PROPS} levelName={levelName} />);

      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('GET');
      expect(requests[0].url).to.equal(`/level_starter_assets/${levelName}/`);
    });

    it('does not get starter assets if no levelName', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} levelName={undefined} />);

      expect(requests).to.have.length(0);
    });

    it('gets files if projectId is present', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} projectId={'1'} />);

      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('GET');
      expect(requests[0].url).to.equal('/v3/assets/1');
    });

    it('does not get files if no projectId', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} projectId={undefined} />);

      expect(requests).to.have.length(0);
    });

    it('gets files with useFilesApi', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />);

      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal('GET');
      expect(requests[0].url).to.equal('/v3/files/1');
    });

    it('renders spinner while waiting for files with useFilesApi', () => {
      const wrapper = shallow(
        <AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />
      );

      // There should be a spinner
      expect(
        wrapper.find('i').filterWhere(p => p.hasClass('fa-spinner'))
      ).to.have.lengthOf(1);
    });

    it('stops rendering spinner after receiving a files list with useFilesApi', () => {
      const wrapper = shallow(
        <AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />
      );

      expect(requests).to.have.length(1);
      requests[0].respond(
        200,
        {},
        JSON.stringify({
          files: [
            {
              filename: 'name.jpg',
              category: 'image',
              size: 100,
              versionId: 'asldfklsakdfj'
            }
          ],
          filesVersionId: 'fake-version'
        })
      );

      // There should be no spinner
      expect(
        wrapper.find('i').filterWhere(p => p.hasClass('fa-spinner'))
      ).to.have.lengthOf(0);
    });

    it('stops rendering spinner after receiving an empty 404 with useFilesApi', () => {
      const wrapper = shallow(
        <AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />
      );

      expect(requests).to.have.length(1);
      requests[0].respond(404, {}, 'Not Found');

      // There should be no spinner
      expect(
        wrapper.find('i').filterWhere(p => p.hasClass('fa-spinner'))
      ).to.have.lengthOf(0);
    });
  });
});
