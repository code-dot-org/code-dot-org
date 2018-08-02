import $ from 'jquery';
import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import VersionHistory from '@cdo/apps/templates/VersionHistory';
import VersionRow from '@cdo/apps/templates/VersionRow';
import {sources as sourcesApi, files as filesApi} from '@cdo/apps/clientApi';
import * as utils from '@cdo/apps/utils';
import project from '@cdo/apps/code-studio/initApp/project';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const FAKE_CURRENT_VERSION = 'current-version-id';
const FAKE_PREVIOUS_VERSION = 'previous-version-id';
const FAKE_VERSION_LIST_RESPONSE = {
  responseText: JSON.stringify(
    [
      {
        versionId: FAKE_CURRENT_VERSION,
        lastModified: Date.now(),
        isLatest: true,
      },
      {
        versionId: FAKE_PREVIOUS_VERSION,
        lastModified: Date.now(),
        isLatest: false,
      }
    ]
  )
};

describe('VersionHistory', () => {
  let wrapper;

  before(() => {
    // Stub jQuery timeago plugin
    $.fn.timeago = () => {};
  });

  beforeEach(() => {
    sinon.stub(utils, 'reload');
  });

  afterEach(() => {
    utils.reload.restore();

    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }
  });

  describe('using the sources api', () => {
    beforeEach(() => {
      sinon.stub(sourcesApi, 'ajax');
      sinon.stub(sourcesApi, 'restorePreviousFileVersion');
    });

    afterEach(() => {
      sourcesApi.restorePreviousFileVersion.restore();
      sourcesApi.ajax.restore();
    });

    testVersionHistory({
      props: {
        handleClearPuzzle: () => {},
        useFilesApi: false
      },
      finishVersionHistoryLoad: () => sourcesApi.ajax.firstCall.args[2](FAKE_VERSION_LIST_RESPONSE),
      failVersionHistoryLoad: () => sourcesApi.ajax.firstCall.args[3](),
      restoreSpy: () => sourcesApi.restorePreviousFileVersion,
      finishRestoreVersion: () => sourcesApi.restorePreviousFileVersion.firstCall.args[2](),
      failRestoreVersion: () => sourcesApi.restorePreviousFileVersion.firstCall.args[3](),
    });
  });

  describe('using the files api', () => {
    beforeEach(() => {
      sinon.stub(filesApi, 'getVersionHistory');
      sinon.stub(filesApi, 'restorePreviousVersion');
    });

    afterEach(() => {
      filesApi.restorePreviousVersion.restore();
      filesApi.getVersionHistory.restore();
    });

    testVersionHistory({
      props: {
        handleClearPuzzle: () => {},
        useFilesApi: true
      },
      finishVersionHistoryLoad: () => filesApi.getVersionHistory.firstCall.args[0](FAKE_VERSION_LIST_RESPONSE),
      failVersionHistoryLoad: () => filesApi.getVersionHistory.firstCall.args[1](),
      restoreSpy: () => filesApi.restorePreviousVersion,
      finishRestoreVersion: () => filesApi.restorePreviousVersion.firstCall.args[1](),
      failRestoreVersion: () => filesApi.restorePreviousVersion.firstCall.args[2](),
    });
  });

  function testVersionHistory({
    props,
    finishVersionHistoryLoad,
    failVersionHistoryLoad,
    restoreSpy,
    finishRestoreVersion,
    failRestoreVersion
  }) {
    it('renders loading spinner at first', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      expect(wrapper).to.containMatchingElement(
        <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}/>
      );
    });

    it('renders an error on failed version history load', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      failVersionHistoryLoad();
      expect(wrapper).to.contain.text('An error occurred.');
    });

    it('renders a version list on successful version history load', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      // Call third argument, the success handler
      finishVersionHistoryLoad();

      // Spinner goes away
      expect(wrapper).not.to.containMatchingElement(
        <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}/>
      );

      // Rendered two version rows
      expect(wrapper.find(VersionRow)).to.have.length(2);
    });

    it('attempts to restore a chosen version when clicking restore button', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      finishVersionHistoryLoad();
      expect(restoreSpy()).not.to.have.been.called;

      wrapper.find('.btn-info').first().simulate('click');
      expect(restoreSpy()).to.have.been.calledOnce;
    });

    it('renders an error on failed restore', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      finishVersionHistoryLoad();
      wrapper.find('.btn-info').first().simulate('click');

      failRestoreVersion();
      expect(wrapper).to.contain.text('An error occurred.');
    });

    it('reloads the page on successful restore', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      finishVersionHistoryLoad();
      wrapper.find('.btn-info').first().simulate('click');
      expect(utils.reload).not.to.have.been.called;

      finishRestoreVersion();
      expect(utils.reload).to.have.been.calledOnce;
    });

    it('shows a confirmation after clicking Start Over', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('.btn-danger').simulate('click');

      // Expect confirmation to show
      expect(wrapper).to.containMatchingElement(
        <div>
          <p>Are you sure you want to clear all progress for this level&#63;</p>
          <button id="confirm-button">Start Over</button>
          <button id="again-button">Cancel</button>
        </div>
      );
    });

    it('goes back to version list after cancelling Start Over', () => {
      wrapper = mount(
        <VersionHistory {...props}/>
      );
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('.btn-danger').simulate('click');

      // Expect confirmation to show
      expect(wrapper).to.containMatchingElement(
        <div>
          <p>Are you sure you want to clear all progress for this level&#63;</p>
          <button id="confirm-button">Start Over</button>
          <button id="again-button">Cancel</button>
        </div>
      );

      // Click "Cancel"
      wrapper.find('#again-button').simulate('click');

      // Rendered two version rows
      expect(wrapper.find(VersionRow)).to.have.length(2);
    });

    describe('confirming Start Over', () => {
      let wrapper, handleClearPuzzle;

      beforeEach(() => {
        sinon.stub(firehoseClient, 'putRecord');
        sinon.stub(project, 'getCurrentId').returns('fake-project-id');
        sinon.stub(project, 'getCurrentSourceVersionId').returns(FAKE_CURRENT_VERSION);
        sinon.stub(project, 'getShareUrl').returns('fake-share-url');
        sinon.stub(project, 'isOwner').returns(true);
        sinon.stub(project, 'save');

        handleClearPuzzle = sinon.stub().returns(Promise.resolve());
        wrapper = mount(
          <VersionHistory
            {...props}
            handleClearPuzzle={handleClearPuzzle}
          />
        );
        finishVersionHistoryLoad();
        wrapper.find('.btn-danger').simulate('click');
        wrapper.find('#confirm-button').simulate('click');
      });

      afterEach(async () => {
        await wasCalled(utils.reload);
        firehoseClient.putRecord.restore();
        project.getCurrentId.restore();
        project.getCurrentSourceVersionId.restore();
        project.getShareUrl.restore();
        project.isOwner.restore();
        project.save.restore();
      });

      it('immediately renders spinner', () => {
        expect(wrapper).to.containMatchingElement(
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}/>
        );
      });

      it('logs to firehose', () => {
        expect(firehoseClient.putRecord).to.have.been.calledOnce.and.calledWith(
          {
            study: 'project-data-integrity',
            study_group: 'v3',
            event: 'clear-puzzle',
            project_id: 'fake-project-id',
            data_json: JSON.stringify({
              isOwner: true,
              currentUrl: window.location.href,
              shareUrl: 'fake-share-url',
              currentSourceVersionId: FAKE_CURRENT_VERSION,
            }),
          },
          {includeUserId: true}
        );
      });

      it('calls handleClearPuzzle prop', () => {
        expect(handleClearPuzzle).to.have.been.calledOnce;
      });

      it('calls project.save(true)', async () => {
        await wasCalled(project.save);
        expect(project.save).to.have.been.calledOnce.and.calledWith(true);
      });

      it('reloads the page', async () => {
        await wasCalled(utils.reload);
        expect(utils.reload).to.have.been.calledOnce;
      });
    });
  }
});

async function wasCalled(spy) {
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (spy.callCount > 0) {
        clearInterval(interval);
        resolve();
      }
    }, 0);
  });
}
