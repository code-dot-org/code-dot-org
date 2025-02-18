import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {sources as sourcesApi, files as filesApi} from '@cdo/apps/clientApi';
import project from '@cdo/apps/code-studio/initApp/project';
import firehoseClient from '@cdo/apps/metrics/firehose';
import VersionHistory from '@cdo/apps/templates/VersionHistory';
import VersionRow from '@cdo/apps/templates/VersionRow';
import * as utils from '@cdo/apps/utils';

const FAKE_CURRENT_VERSION = 'current-version-id';
const FAKE_PREVIOUS_VERSION = 'previous-version-id';
const FAKE_VERSION_LIST_RESPONSE = {
  responseText: JSON.stringify([
    {
      versionId: FAKE_CURRENT_VERSION,
      lastModified: new Date('2018-08-01T03:00:00'),
      isLatest: true,
    },
    {
      versionId: FAKE_PREVIOUS_VERSION,
      lastModified: new Date('2018-07-31T02:00:00'),
      isLatest: false,
    },
  ]),
};

jest.mock('@cdo/apps/code-studio/initApp/project', () => ({
  getCurrentId: jest.fn().mockReturnValue('fake-project-id'),
  getCurrentSourceVersionId: jest.fn().mockReturnValue('current-version-id'),
  getShareUrl: jest.fn().mockReturnValue('fake-share-url'),
  isOwner: jest.fn().mockReturnValue(true),
  save: jest.fn(),
}));

describe('VersionHistory', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(utils, 'reload').mockClear().mockImplementation();
  });

  afterEach(() => {
    utils.reload.mockRestore();

    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }
  });

  describe('using the sources api', () => {
    beforeEach(() => {
      jest.spyOn(sourcesApi, 'ajax').mockClear().mockImplementation();
      jest
        .spyOn(sourcesApi, 'restorePreviousFileVersion')
        .mockClear()
        .mockImplementation();
    });

    afterEach(() => {
      sourcesApi.restorePreviousFileVersion.mockRestore();
      sourcesApi.ajax.mockRestore();
    });

    testVersionHistory({
      props: {
        handleClearPuzzle: () => {},
        isProjectTemplateLevel: false,
        useFilesApi: false,
        isReadOnly: false,
      },
      finishVersionHistoryLoad: () => {
        sourcesApi.ajax.mock.calls[0][2](FAKE_VERSION_LIST_RESPONSE);
        wrapper.update();
      },
      failVersionHistoryLoad: () => sourcesApi.ajax.mock.calls[0][3](),
      restoreSpy: () => sourcesApi.restorePreviousFileVersion,
      finishRestoreVersion: () =>
        sourcesApi.restorePreviousFileVersion.mock.calls[0][2](),
      failRestoreVersion: () =>
        sourcesApi.restorePreviousFileVersion.mock.calls[0][3](),
    });
  });

  describe('using the files api', () => {
    beforeEach(() => {
      jest
        .spyOn(filesApi, 'getVersionHistory')
        .mockClear()
        .mockImplementation();
      jest
        .spyOn(filesApi, 'restorePreviousVersion')
        .mockClear()
        .mockImplementation();
    });

    afterEach(() => {
      filesApi.restorePreviousVersion.mockRestore();
      filesApi.getVersionHistory.mockRestore();
    });

    testVersionHistory({
      props: {
        handleClearPuzzle: () => {},
        isProjectTemplateLevel: false,
        useFilesApi: true,
        isReadOnly: false,
      },
      finishVersionHistoryLoad: () => {
        filesApi.getVersionHistory.mock.calls[0][0](FAKE_VERSION_LIST_RESPONSE);
        wrapper.update();
      },
      failVersionHistoryLoad: () =>
        filesApi.getVersionHistory.mock.calls[0][1](),
      restoreSpy: () => filesApi.restorePreviousVersion,
      finishRestoreVersion: () =>
        filesApi.restorePreviousVersion.mock.calls[0][1](),
      failRestoreVersion: () =>
        filesApi.restorePreviousVersion.mock.calls[0][2](),
    });
  });

  function testVersionHistory({
    props,
    finishVersionHistoryLoad,
    failVersionHistoryLoad,
    restoreSpy,
    finishRestoreVersion,
    failRestoreVersion,
  }) {
    it('renders loading spinner at first', () => {
      wrapper = mount(<VersionHistory {...props} />);
      expect(
        wrapper.containsMatchingElement(
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        )
      ).toBeTruthy();
    });

    it('renders an error on failed version history load', () => {
      wrapper = mount(<VersionHistory {...props} />);
      failVersionHistoryLoad();
      expect(wrapper.text()).toContain('An error occurred.');
    });

    it('renders a version list on successful version history load', () => {
      wrapper = mount(<VersionHistory {...props} />);
      // Call third argument, the success handler
      finishVersionHistoryLoad();

      // Spinner goes away
      expect(
        !wrapper.containsMatchingElement(
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        )
      ).toBeTruthy();

      // Rendered two version rows
      expect(wrapper.find(VersionRow)).toHaveLength(2);
    });

    it('attempts to restore a chosen version when clicking restore button', () => {
      wrapper = mount(<VersionHistory {...props} />);
      finishVersionHistoryLoad();
      expect(restoreSpy()).not.toHaveBeenCalled();

      wrapper.find('.img-upload').first().simulate('click');
      expect(restoreSpy()).toHaveBeenCalledTimes(1);
    });

    it('renders an error on failed restore', () => {
      wrapper = mount(<VersionHistory {...props} />);
      finishVersionHistoryLoad();
      wrapper.find('.img-upload').first().simulate('click');

      failRestoreVersion();
      expect(wrapper.text()).toContain('An error occurred.');
    });

    it('reloads the page on successful restore', () => {
      wrapper = mount(<VersionHistory {...props} />);
      finishVersionHistoryLoad();
      wrapper.find('.img-upload').first().simulate('click');
      expect(utils.reload).not.toHaveBeenCalled();

      finishRestoreVersion();
      expect(utils.reload).toHaveBeenCalledTimes(1);
    });

    it('shows a confirmation after clicking Start Over', () => {
      wrapper = mount(<VersionHistory {...props} />);
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('.btn-danger').simulate('click');

      // Expect confirmation to show
      expect(
        wrapper.containsMatchingElement(
          <div>
            <p>
              Are you sure you want to restart this level? This will clear all
              of your code.
            </p>
            <button type="button" id="start-over-button">
              Start over
            </button>
            <button type="button" id="again-button">
              Cancel
            </button>
          </div>
        )
      ).toBeTruthy();
    });

    it('goes back to version list after cancelling Start Over', () => {
      wrapper = mount(<VersionHistory {...props} />);
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('.btn-danger').simulate('click');

      // Expect confirmation to show
      expect(
        wrapper.containsMatchingElement(
          <div>
            <p>
              Are you sure you want to restart this level? This will clear all
              of your code.
            </p>
            <button type="button" id="start-over-button">
              Start over
            </button>
            <button type="button" id="again-button">
              Cancel
            </button>
          </div>
        )
      ).toBeTruthy();

      // Click "Cancel"
      wrapper.find('#again-button').simulate('click');

      // Rendered two version rows
      expect(wrapper.find(VersionRow)).toHaveLength(2);
    });

    it('shows a confirmation with template project warning', () => {
      wrapper = mount(<VersionHistory {...props} isProjectTemplateLevel />);
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('.btn-danger').simulate('click');

      expect(wrapper.find('.template-level-warning')).toBeDefined();
    });

    describe('confirming Start Over', () => {
      let handleClearPuzzle;

      beforeEach(() => {
        jest
          .spyOn(firehoseClient, 'putRecord')
          .mockClear()
          .mockImplementation();

        handleClearPuzzle = jest.fn().mockReturnValue(Promise.resolve());
        wrapper = mount(
          <VersionHistory {...props} handleClearPuzzle={handleClearPuzzle} />
        );
        finishVersionHistoryLoad();
        wrapper.find('.btn-danger').simulate('click');
        wrapper.find('#start-over-button').simulate('click');
      });

      afterEach(async () => {
        await wasCalled(utils.reload);
        firehoseClient.putRecord.mockRestore();
      });

      it('immediately renders spinner', () => {
        expect(
          wrapper.containsMatchingElement(
            <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
          )
        );
      });

      it('logs to firehose', () => {
        expect(firehoseClient.putRecord).toHaveBeenCalledWith(
          {
            study: 'project-data-integrity',
            study_group: 'v4',
            event: 'clear-puzzle',
            project_id: 'fake-project-id',
            data_json: JSON.stringify({
              isOwner: true,
              currentUrl: window.location.href,
              shareUrl: 'fake-share-url',
              isProjectTemplateLevel: false,
              currentSourceVersionId: FAKE_CURRENT_VERSION,
            }),
          },
          {includeUserId: true}
        );
      });

      it('calls handleClearPuzzle prop', () => {
        expect(handleClearPuzzle).toHaveBeenCalledTimes(1);
      });

      it('calls project.save(true)', async () => {
        await wasCalled(project.save);
        expect(project.save.mock.calls.length).toBe(1);
        expect(project.save.mock.calls[0][0]).toBe(true);
      });

      it('reloads the page', async () => {
        await wasCalled(utils.reload);
        expect(utils.reload).toHaveBeenCalledTimes(1);
      });
    });
  }
});

async function wasCalled(spy) {
  await new Promise(resolve => {
    const interval = setInterval(() => {
      // swap between sinon and jest mocks
      const callCount = Object.prototype.hasOwnProperty.call(spy, 'callCount')
        ? spy.callCount
        : spy.mock.calls.length;
      if (callCount > 0) {
        clearInterval(interval);
        resolve();
      }
    }, 0);
  });
}
