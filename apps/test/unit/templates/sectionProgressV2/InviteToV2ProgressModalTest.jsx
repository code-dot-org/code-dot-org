import {fireEvent, render, screen} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import currentUser, {
  setHasSeenProgressTableInvite,
} from '@cdo/apps/templates/currentUserRedux';
import {UnconnectedInviteToV2ProgressModal} from '@cdo/apps/templates/sectionProgressV2/InviteToV2ProgressModal';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

// const setShowProgressTableV2Stub = sinon.stub();
// const setHasSeenProgressTableInviteStub = sinon.stub();

const DEFAULT_PROPS = {
  setShowProgressTableV2: () => {},
  setHasSeenProgressTableInvite: () => {},
  setDateProgressTableInvitationDelayed: () => {},
};

describe('UnconnectedInviteToV2ProgressModal', () => {
  let store;
  let postStub;

  beforeEach(() => {
    postStub = sinon.stub($, 'post').returns(Promise.resolve({}));

    stubRedux();
    registerReducers({
      currentUser,
    });

    store = getStore();
    store.dispatch(setHasSeenProgressTableInvite(false));
  });

  afterEach(() => {
    restoreRedux();
    postStub.restore();
    // setHasSeenProgressTableInviteStub.restore();
    // setShowProgressTableV2Stub.restore();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <UnconnectedInviteToV2ProgressModal
          {...DEFAULT_PROPS}
          {...propOverrides}
        />
      </Provider>
    );
  }

  it('renders the dialog with required elements', () => {
    renderDefault();

    expect(screen.getByText(i18n.progressTrackingAnnouncement())).be.visible;
    expect(screen.getByText(i18n.tryItNow())).be.visible;
    expect(screen.getByText(i18n.remindMeLater())).be.visible;
    expect(screen.getByLabelText(i18n.closeDialog())).be.visible;
  });

  it('allows user to accept the invitation', () => {
    const setShowProgressTableV2Stub = sinon.stub();
    const setHasSeenProgressTableInviteStub = sinon.stub();

    renderDefault({
      setShowProgressTableV2: setShowProgressTableV2Stub,
      setHasSeenProgressTableInvite: setHasSeenProgressTableInviteStub,
    });

    expect(screen.getByText(i18n.progressTrackingAnnouncement())).be.visible;
    const acceptButton = screen.getByText(i18n.tryItNow());
    fireEvent.click(acceptButton);

    expect(setHasSeenProgressTableInviteStub).to.have.been.calledOnce;
    expect(setShowProgressTableV2Stub).to.have.been.calledOnce;

    expect(postStub).calledWith('/api/v1/users/show_progress_table_v2', {
      show_progress_table_v2: true,
    });
    expect(postStub).calledWith(
      '/api/v1/users/has_seen_progress_table_v2_invitation',
      {
        has_seen_progress_table_v2_invitation: true,
      }
    );
  });

  it('allows user to decline the invitation', () => {
    const setHasSeenProgressTableInviteStub = sinon.stub();

    renderDefault({
      setHasSeenProgressTableInvite: setHasSeenProgressTableInviteStub,
    });

    const xButton = screen.getByLabelText(i18n.closeDialog());
    fireEvent.click(xButton);

    expect(setHasSeenProgressTableInviteStub).to.have.been.calledOnce;
    expect(postStub).calledWith(
      '/api/v1/users/has_seen_progress_table_v2_invitation',
      {
        has_seen_progress_table_v2_invitation: true,
      }
    );
    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });

  // it('allows user to delay the invitation', () => {
  //   renderDefault();

  //   const delayButton = screen.getByText(i18n.remindMeLater());
  //   fireEvent.click(delayButton);

  //   expect(postStub).calledWith(
  //     '/api/v1/users/date_progress_table_invitation_last_delayed'
  //   ).to.be.true;
  //   expect(screen.queryByText(i18n.tryItNow())).to.be.null;
  //   expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
  //   expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  // });

  it('does not show the dialog if they have already accepted or rejected the invitation', () => {
    renderDefault({hasSeenProgressTableInvite: true});

    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });

  it('shows the dialog if it has been more than three days since they delayed the pop-up', () => {
    renderDefault({
      dateProgressTableInvitationDelayed:
        'Wed May 01 2024 14:22:23 GMT-0500 (Central Daylight Time)',
    });

    expect(screen.getByText(i18n.progressTrackingAnnouncement())).be.visible;
    expect(screen.getByText(i18n.tryItNow())).be.visible;
    expect(screen.getByText(i18n.remindMeLater())).be.visible;
    expect(screen.getByLabelText(i18n.closeDialog())).be.visible;
  });

  it('does not show the dialog if it has been less than three days since they delayed the pop-up', () => {
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);
    renderDefault({
      dateProgressTableInvitationDelayed: yesterday,
    });

    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });
});
