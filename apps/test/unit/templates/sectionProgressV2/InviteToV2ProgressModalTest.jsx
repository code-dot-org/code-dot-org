import {fireEvent, render, screen} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedInviteToV2ProgressModal} from '@cdo/apps/templates/sectionProgressV2/InviteToV2ProgressModal';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  setShowProgressTableV2: () => {},
  setHasSeenProgressTableInvite: () => {},
  setDateProgressTableInvitationDelayed: () => {},
  setHasJustSwitchedToV2: () => {},
};

describe('InviteToV2ProgressModal', () => {
  let postStub;

  beforeEach(() => {
    postStub = sinon.stub($, 'post').returns(Promise.resolve({}));
  });

  afterEach(() => {
    postStub.restore();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <UnconnectedInviteToV2ProgressModal
        {...DEFAULT_PROPS}
        {...propOverrides}
      />
    );
  }

  it('renders the dialog with required elements', () => {
    renderDefault({
      hasSeenProgressTableInvite: false,
      dateProgressTableInvitationDelayed: null,
    });

    screen.getByText(i18n.progressTrackingAnnouncement());
    screen.getByText(i18n.tryItNow());
    screen.getByText(i18n.remindMeLater());
    screen.getByLabelText(i18n.closeDialog());
  });

  it('allows user to accept the invitation', () => {
    const setShowProgressTableV2Stub = sinon.stub();
    const setHasSeenProgressTableInviteStub = sinon.stub();
    const setHasJustSwitchedToV2Stub = sinon.stub();

    renderDefault({
      setShowProgressTableV2: setShowProgressTableV2Stub,
      setHasSeenProgressTableInvite: setHasSeenProgressTableInviteStub,
      hasSeenProgressTableInvite: false,
      dateProgressTableInvitationDelayed: null,
      setHasJustSwitchedToV2: setHasJustSwitchedToV2Stub,
    });

    screen.getByText(i18n.progressTrackingAnnouncement());
    const acceptButton = screen.getByText(i18n.tryItNow());
    fireEvent.click(acceptButton);

    expect(setHasJustSwitchedToV2Stub).to.have.been.calledOnce;
    expect(setHasSeenProgressTableInviteStub).to.have.been.calledOnce;
    expect(setShowProgressTableV2Stub).to.have.been.calledOnce;

    expect(postStub).to.have.been.calledOnce;
    expect(postStub).calledWith(
      '/api/v1/users/has_seen_progress_table_v2_invitation',
      {
        has_seen_progress_table_v2_invitation: true,
        show_progress_table_v2: true,
      }
    );
  });

  it('allows user to decline the invitation', () => {
    const setHasSeenProgressTableInviteStub = sinon.stub();

    renderDefault({
      setHasSeenProgressTableInvite: setHasSeenProgressTableInviteStub,
      hasSeenProgressTableInvite: false,
      dateProgressTableInvitationDelayed: null,
    });

    const xButton = screen.getByLabelText(i18n.closeDialog());
    fireEvent.click(xButton);

    expect(setHasSeenProgressTableInviteStub).to.have.been.calledOnce;

    expect(postStub).calledWith(
      '/api/v1/users/has_seen_progress_table_v2_invitation',
      {
        has_seen_progress_table_v2_invitation: true,
        show_progress_table_v2: false,
      }
    );
    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });

  it('allows user to delay the invitation', () => {
    renderDefault({
      hasSeenProgressTableInvite: false,
      dateProgressTableInvitationDelayed: null,
    });

    const delayButton = screen.getByText(i18n.remindMeLater());
    fireEvent.click(delayButton);

    sinon.assert.calledOnce(postStub);
    sinon.assert.calledWithMatch(
      postStub,
      '/api/v1/users/date_progress_table_invitation_last_delayed'
    );

    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });

  it('does not show the dialog if they have already accepted or rejected the invitation', () => {
    renderDefault({hasSeenProgressTableInvite: true});

    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });

  it('does not show the dialog if they have already accepted or rejected the invitation after delaying invitation', () => {
    renderDefault({
      hasSeenProgressTableInvite: true,
      dateProgressTableInvitationDelayed:
        'Wed May 01 2024 14:22:23 GMT-0500 (Central Daylight Time)',
    });

    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });

  it('shows the dialog if it has been more than three days since they delayed the pop-up', () => {
    renderDefault({
      dateProgressTableInvitationDelayed:
        'Wed May 01 2024 14:22:23 GMT-0500 (Central Daylight Time)',
      hasSeenProgressTableInvite: false,
    });

    screen.getByText(i18n.progressTrackingAnnouncement());
    screen.getByText(i18n.tryItNow());
    screen.getByText(i18n.remindMeLater());
    screen.getByLabelText(i18n.closeDialog());
  });

  it('does not show the dialog if it has been less than three days since they delayed the pop-up', () => {
    const today = new Date();
    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);
    renderDefault({
      dateProgressTableInvitationDelayed: yesterday,
      hasSeenProgressTableInvite: false,
    });

    expect(screen.queryByText(i18n.tryItNow())).to.be.null;
    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.be.null;
    expect(screen.queryByText(i18n.remindMeLater())).to.be.null;
  });
});
