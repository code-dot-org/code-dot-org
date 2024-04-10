import {render, screen, fireEvent} from '@testing-library/react';
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';

import DCDO from '@cdo/apps/dcdo';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setShowProgressTableV2,
  setProgressTableV2ClosedBeta,
  setDateProgressTableInvitationDelayed,
  setHasSeenProgressTableInvite,
} from '@cdo/apps/templates/currentUserRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import progressV2Feedback from '@cdo/apps/templates/sectionProgressV2/progressV2FeedbackRedux';
import SectionProgressSelector from '@cdo/apps/templates/sectionProgressV2/SectionProgressSelector.jsx';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

const V1_PAGE_LINK_TEXT = 'Try out new progress view (beta)';
const V2_PAGE_LINK_TEXT = 'Switch to old progress view';
const V1_TEST_ID = 'section-progress-v1';
const V2_TEST_ID = 'section-progress-v2';

const DEFAULT_PROPS = {};

jest.mock('@cdo/apps/templates/sectionProgress/sectionProgressLoader');

describe('SectionProgressSelector', () => {
  let store;

  let postStub;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
      progressV2Feedback,
    });

    store = getStore();
    store.dispatch(setShowProgressTableV2(false));
    store.dispatch(setScriptId(1));

    DCDO.set('progress-table-v2-enabled', true);
    DCDO.set('progress-table-v2-default-v2', false);
    DCDO.set('progress-table-v2-closed-beta-enabled', false);

    postStub = sinon.stub($, 'post');
    postStub.returns(Promise.resolve());

    sinon.stub(_, 'debounce').callsFake(fn => fn);
  });

  afterEach(() => {
    restoreRedux();

    postStub.restore();
    sinon.restore();
  });

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <SectionProgressSelector {...DEFAULT_PROPS} {...propOverrides} />
      </Provider>
    );
  }

  it('does not show toggle link if disabled', () => {
    DCDO.set('progress-table-v2-enabled', false);
    renderDefault();
    store.dispatch(setShowProgressTableV2(true));

    expect(screen.queryByText(V1_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;
  });

  it('shows v1 if disabled', () => {
    DCDO.set('progress-table-v2-enabled', false);
    renderDefault();
    store.dispatch(setShowProgressTableV2(true));

    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByTestId(V2_TEST_ID)).to.not.exist;
  });

  it('shows v1', () => {
    renderDefault();

    screen.getByText(V1_PAGE_LINK_TEXT);
    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByTestId(V2_TEST_ID)).to.not.exist;
  });

  it('shows v2', () => {
    renderDefault();
    store.dispatch(setShowProgressTableV2(true));

    screen.getByText(V2_PAGE_LINK_TEXT);
    screen.getByTestId(V2_TEST_ID);

    expect(screen.queryByText(V1_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByTestId(V1_TEST_ID)).to.not.exist;
  });

  it('shows default v1 if no user preference', () => {
    renderDefault();
    store.dispatch(setShowProgressTableV2(undefined));

    screen.getByText(V1_PAGE_LINK_TEXT);
    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByTestId(V2_TEST_ID)).to.not.exist;
  });

  it('shows default v2 if no user preference', () => {
    DCDO.set('progress-table-v2-default-v2', true);
    store.dispatch(setShowProgressTableV2(undefined));
    renderDefault();

    screen.getByText(V2_PAGE_LINK_TEXT);
    screen.getByTestId(V2_TEST_ID);

    expect(screen.queryByText(V1_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByTestId(V1_TEST_ID)).to.not.exist;
  });

  it('sets user preference when link clicked', () => {
    renderDefault();

    const link = screen.getByText(V1_PAGE_LINK_TEXT);
    fireEvent.click(link);

    expect(postStub).to.have.been.calledWith(
      '/api/v1/users/show_progress_table_v2',
      {
        show_progress_table_v2: true,
      }
    );
  });

  it('shows v1 only if user not in closed beta', () => {
    DCDO.set('progress-table-v2-enabled', false);
    DCDO.set('progress-table-v2-closed-beta-enabled', true);
    renderDefault();

    expect(screen.queryByText(V1_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;

    screen.getByTestId(V1_TEST_ID);
    expect(screen.queryByTestId(V2_TEST_ID)).to.not.exist;
  });

  it('shows toggle if user is in closed beta', () => {
    DCDO.set('progress-table-v2-enabled', false);
    DCDO.set('progress-table-v2-closed-beta-enabled', true);
    store.dispatch(setProgressTableV2ClosedBeta(true));
    renderDefault();

    screen.getByText(V1_PAGE_LINK_TEXT);

    screen.getByTestId(V1_TEST_ID);
    expect(screen.queryByTestId(V2_TEST_ID)).to.not.exist;
  });

  it('shows toggle if user not in closed beta, but v2 enabled', () => {
    DCDO.set('progress-table-v2-enabled', true);
    DCDO.set('progress-table-v2-closed-beta-enabled', true);
    renderDefault();

    screen.getByText(V1_PAGE_LINK_TEXT);
    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByTestId(V2_TEST_ID)).to.not.exist;
  });

  it('shows modal if modal is available', () => {
    DCDO.set('progress-table-v2-enabled', true);
    DCDO.set('progress-table-v2-closed-beta-enabled', true);
    DCDO.set('disable-try-new-progress-view-modal', false);

    store.dispatch(setDateProgressTableInvitationDelayed(''));
    store.dispatch(setHasSeenProgressTableInvite(false));

    renderDefault();

    screen.getByText(i18n.progressTrackingAnnouncement());
  });

  it('does not show modal if modal is not available', () => {
    DCDO.set('progress-table-v2-enabled', true);
    DCDO.set('progress-table-v2-closed-beta-enabled', true);
    DCDO.set('disable-try-new-progress-view-modal', true);

    store.dispatch(setDateProgressTableInvitationDelayed(''));
    store.dispatch(setHasSeenProgressTableInvite(false));

    renderDefault();

    screen.getByText(V1_PAGE_LINK_TEXT);
    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByText(i18n.progressTrackingAnnouncement())).to.not
      .exist;
  });
});
