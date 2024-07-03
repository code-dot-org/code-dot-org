import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AssetManager from '@cdo/apps/code-studio/components/AssetManager';



const DEFAULT_PROPS = {
  uploadsEnabled: true,
};

describe('AssetManager', () => {
  var xhr, requests;

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    xhr.mockRestore();
  });

  describe('componentDidMount', () => {
    it('gets starter assets if levelName is present', () => {
      const levelName = 'my level name';
      shallow(<AssetManager {...DEFAULT_PROPS} levelName={levelName} />);

      expect(requests).toHaveLength(1);
      expect(requests[0].method).toBe('GET');
      expect(requests[0].url).toBe(`/level_starter_assets/${levelName}/`);
    });

    it('does not get starter assets if no levelName', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} levelName={undefined} />);

      expect(requests).toHaveLength(0);
    });

    it('gets files if projectId is present', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} projectId={'1'} />);

      expect(requests).toHaveLength(1);
      expect(requests[0].method).toBe('GET');
      expect(requests[0].url).toBe('/v3/assets/1');
    });

    it('does not get files if no projectId', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} projectId={undefined} />);

      expect(requests).toHaveLength(0);
    });

    it('gets files with useFilesApi', () => {
      shallow(<AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />);

      expect(requests).toHaveLength(1);
      expect(requests[0].method).toBe('GET');
      expect(requests[0].url).toBe('/v3/files/1');
    });

    it('renders spinner while waiting for files with useFilesApi', () => {
      const wrapper = shallow(
        <AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />
      );

      // There should be a spinner
      expect(
        wrapper.find('i').filterWhere(p => p.hasClass('fa-spinner'))
      ).toHaveLength(1);
    });

    it('stops rendering spinner after receiving a files list with useFilesApi', () => {
      const wrapper = shallow(
        <AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />
      );

      expect(requests).toHaveLength(1);
      requests[0].respond(
        200,
        {},
        JSON.stringify({
          files: [
            {
              filename: 'name.jpg',
              category: 'image',
              size: 100,
              versionId: 'asldfklsakdfj',
            },
          ],
          filesVersionId: 'fake-version',
        })
      );

      // There should be no spinner
      expect(
        wrapper.find('i').filterWhere(p => p.hasClass('fa-spinner'))
      ).toHaveLength(0);
    });

    it('stops rendering spinner after receiving an empty 404 with useFilesApi', () => {
      const wrapper = shallow(
        <AssetManager {...DEFAULT_PROPS} projectId={'1'} useFilesApi />
      );

      expect(requests).toHaveLength(1);
      requests[0].respond(404, {}, 'Not Found');

      // There should be no spinner
      expect(
        wrapper.find('i').filterWhere(p => p.hasClass('fa-spinner'))
      ).toHaveLength(0);
    });
  });
});
