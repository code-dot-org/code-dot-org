import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {sources as sourcesApi} from '@cdo/apps/clientApi';
import project from '@cdo/apps/code-studio/initApp/project';
import harness from '@cdo/apps/lib/util/harness';
import VersionHistoryWithCommitsDialog from '@cdo/apps/templates/VersionHistoryWithCommitsDialog';
import * as utils from '@cdo/apps/utils';

import {assert, expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const FAKE_CURRENT_VERSION = 'current-version-id';
const FAKE_PREVIOUS_VERSION = 'previous-version-id';
const FAKE_VERSION_LIST_RESPONSE = {
  responseText: JSON.stringify([
    {
      versionId: FAKE_CURRENT_VERSION,
      lastModified: new Date('2018-08-01T03:00:00'),
      isLatest: true,
      comment: 'Commit comment',
    },
    {
      versionId: FAKE_PREVIOUS_VERSION,
      lastModified: new Date('2018-07-31T02:00:00'),
      isLatest: false,
    },
  ]),
};

describe('VersionHistoryWithCommitsDialog', () => {
  let wrapper;

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

    testVersionHistoryWithCommitsDialog({
      props: {
        handleClearPuzzle: () => {},
        isProjectTemplateLevel: false,
        onClose: () => {},
        isOpen: true,
      },
      finishVersionHistoryLoad: () => {
        sourcesApi.ajax.firstCall.args[2](FAKE_VERSION_LIST_RESPONSE);
        wrapper.update();
      },
      failVersionHistoryLoad: () => {
        sourcesApi.ajax.firstCall.args[3]();
        wrapper.update();
      },
      restoreSpy: () => sourcesApi.restorePreviousFileVersion,
      finishRestoreVersion: () =>
        sourcesApi.restorePreviousFileVersion.firstCall.args[2](),
      failRestoreVersion: () =>
        sourcesApi.restorePreviousFileVersion.firstCall.args[3](),
    });
  });

  function testVersionHistoryWithCommitsDialog({
    props,
    finishVersionHistoryLoad,
    failVersionHistoryLoad,
    restoreSpy,
    finishRestoreVersion,
    failRestoreVersion,
  }) {
    it('renders loading spinner at first', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      assert(
        wrapper.containsMatchingElement(
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        )
      );
    });

    it('renders an error on failed version history load', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      failVersionHistoryLoad();
      expect(wrapper.text()).to.include('An error occurred.');
    });

    it('renders a version list on successful version history load', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      // Call third argument, the success handler
      finishVersionHistoryLoad();

      // Spinner goes away
      assert(
        !wrapper.containsMatchingElement(
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        )
      );

      // Rendered two version rows
      expect(wrapper.find('VersionWithCommit')).to.have.length(2);
      expect(wrapper.text()).to.include('Commit comment');
    });

    it('attempts to restore a chosen version when clicking restore button', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      finishVersionHistoryLoad();
      expect(restoreSpy()).not.to.have.been.called;

      wrapper.find('Button').at(3).simulate('click');
      expect(restoreSpy()).to.have.been.calledOnce;
    });

    it('renders an error on failed restore', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      finishVersionHistoryLoad();
      wrapper.find('Button').at(3).simulate('click');

      failRestoreVersion();
      expect(wrapper.text()).to.include('An error occurred.');
    });

    it('reloads the page on successful restore', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      finishVersionHistoryLoad();
      wrapper.find('Button').at(3).simulate('click');
      expect(utils.reload).not.to.have.been.called;

      finishRestoreVersion();
      expect(utils.reload).to.have.been.calledOnce;
    });

    it('shows a confirmation after clicking Start Over', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('Button').last().simulate('click');

      // Expect confirmation to show
      assert(
        wrapper.containsMatchingElement(
          <p>
            Are you sure you want to restart this level? This will clear all of
            your code.
          </p>
        )
      );
    });

    it('goes back to version list after cancelling Start Over', () => {
      wrapper = mount(<VersionHistoryWithCommitsDialog {...props} />);
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('Button').last().simulate('click');

      // Expect confirmation to show
      assert(
        wrapper.containsMatchingElement(
          <p>
            Are you sure you want to restart this level? This will clear all of
            your code.
          </p>
        )
      );

      // Click "Cancel"
      wrapper.find('Button').last().simulate('click');

      // Rendered two version rows
      expect(wrapper.find('VersionWithCommit')).to.have.length(2);
    });

    it('shows a confirmation with template project warning', () => {
      wrapper = mount(
        <VersionHistoryWithCommitsDialog {...props} isProjectTemplateLevel />
      );
      finishVersionHistoryLoad();

      // Click "Start Over"
      wrapper.find('Button').last().simulate('click');

      expect(wrapper.find('.template-level-warning')).to.exist;
    });

    describe('confirming Start Over', () => {
      let handleClearPuzzle;

      beforeEach(() => {
        sinon.stub(firehoseClient, 'putRecord');
        sinon.stub(project, 'getCurrentId').returns('fake-project-id');
        sinon
          .stub(project, 'getCurrentSourceVersionId')
          .returns(FAKE_CURRENT_VERSION);
        sinon.stub(project, 'getShareUrl').returns('fake-share-url');
        sinon.stub(project, 'isOwner').returns(true);
        sinon.stub(project, 'save');

        handleClearPuzzle = sinon.stub().returns(Promise.resolve());
        wrapper = mount(
          <VersionHistoryWithCommitsDialog
            {...props}
            handleClearPuzzle={handleClearPuzzle}
          />
        );
        finishVersionHistoryLoad();
        wrapper.find('Button').last().simulate('click');
        wrapper.find('Button').at(1).simulate('click');
      });

      afterEach(async () => {
        await wasCalled(utils.reload);
        harness.trackAnalytics.restore();
        project.getCurrentId.restore();
        project.getCurrentSourceVersionId.restore();
        project.getShareUrl.restore();
        project.isOwner.restore();
        project.save.restore();
      });

      it('immediately renders spinner', () => {
        expect(
          wrapper.containsMatchingElement(
            <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
          )
        );
      });

      it('logs to firehose', () => {
        expect(harness.trackAnalytics).to.have.been.calledOnce.and.calledWith(
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
  await new Promise(resolve => {
    const interval = setInterval(() => {
      if (spy.callCount > 0) {
        clearInterval(interval);
        resolve();
      }
    }, 0);
  });
}
