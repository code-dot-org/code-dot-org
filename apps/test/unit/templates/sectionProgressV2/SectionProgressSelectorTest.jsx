import React from 'react';
import $ from 'jquery';
import {render, screen, fireEvent} from '@testing-library/react';
import {expect} from '../../../util/reconfiguredChai';
import SectionProgressSelector from '@cdo/apps/templates/sectionProgressV2/SectionProgressSelector.jsx';
import DCDO from '@cdo/apps/dcdo';
import sinon from 'sinon';
import currentUser, {
  setShowProgressTableV2,
} from '@cdo/apps/templates/currentUserRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

const V1_PAGE_LINK_TEXT = 'Switch to new progress view';
const V2_PAGE_LINK_TEXT = 'Switch to old progress view';
const V1_TEST_ID = 'section-progress-v1';
const V2_TEST_ID = 'section-progress-v2';

const DEFAULT_PROPS = {};

describe('SectionProgressSelector', () => {
  let store;

  beforeEach(() => {
    stubRedux();
    registerReducers({
      currentUser,
      sectionProgress,
      unitSelection,
      teacherSections,
    });

    store = getStore();
    store.dispatch(setShowProgressTableV2(false));

    DCDO.set('progress-table-v2-enabled', true);
    DCDO.set('progress-table-v2-default-v2', false);
  });

  afterEach(() => {
    restoreRedux();
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

    expect(screen.queryByText(V2_TEST_ID)).to.not.exist;
  });

  it('shows v1', () => {
    renderDefault();

    screen.getByText(V1_PAGE_LINK_TEXT);
    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByText(V2_TEST_ID)).to.not.exist;
  });

  it('shows v2', () => {
    renderDefault();
    store.dispatch(setShowProgressTableV2(true));

    screen.getByText(V2_PAGE_LINK_TEXT);
    screen.getByTestId(V2_TEST_ID);

    expect(screen.queryByText(V1_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByText(V1_TEST_ID)).to.not.exist;
  });

  it('shows default v1 if no user preference', () => {
    renderDefault();
    store.dispatch(setShowProgressTableV2(undefined));

    screen.getByText(V1_PAGE_LINK_TEXT);
    screen.getByTestId(V1_TEST_ID);

    expect(screen.queryByText(V2_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByText(V2_TEST_ID)).to.not.exist;
  });

  it('shows default v2 if no user preference', () => {
    DCDO.set('progress-table-v2-default-v2', true);
    renderDefault();
    store.dispatch(setShowProgressTableV2(undefined));

    screen.getByText(V2_PAGE_LINK_TEXT);
    screen.getByTestId(V2_TEST_ID);

    expect(screen.queryByText(V1_PAGE_LINK_TEXT)).to.not.exist;
    expect(screen.queryByText(V1_TEST_ID)).to.not.exist;
  });

  it('sets user preference when link clicked', () => {
    const stub = sinon.stub($, 'post');
    renderDefault();

    const link = screen.getByText(V1_PAGE_LINK_TEXT);
    fireEvent.click(link);

    expect(stub).calledOnceWith('/api/v1/users/show_progress_table_v2', {
      show_progress_table_v2: true,
    });

    stub.reset();
  });
});
