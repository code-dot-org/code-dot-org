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

const setShowProgressTableV2Stub = sinon.stub();
const setHasSeenProgressTableInviteStub = sinon.stub();

const DEFAULT_PROPS = {
  setShowProgressTableV2: setShowProgressTableV2Stub,
  setHasSeenProgressTableInvite: setHasSeenProgressTableInviteStub,
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
    setHasSeenProgressTableInviteStub.restore();
    setShowProgressTableV2Stub.restore();
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
    // const postStub = sinon.stub($, 'post');
    renderDefault();

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

    // postStub.reset();
  });

  it('allows user to decline the invitation', () => {
    // const postStub = sinon.stub($, 'post');
    renderDefault();

    const xButton = screen.getByLabelText(i18n.closeDialog());
    fireEvent.click(xButton);

    expect(setHasSeenProgressTableInviteStub).to.have.been.calledOnce;
    expect(postStub).calledWith(
      '/api/v1/users/has_seen_progress_table_v2_invitation',
      {
        has_seen_progress_table_v2_invitation: true,
      }
    );
    // postStub.reset();
  });
});
