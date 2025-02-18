import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import {UnconnectedSectionProgress} from '@cdo/apps/templates/sectionProgress/SectionProgress';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';

jest.mock('@cdo/apps/templates/sectionProgress/sectionProgressLoader', () => ({
  loadUnitProgress: jest.fn(),
}));

const DEFAULT_PROPS = {
  setLessonOfInterest: () => {},
  setCurrentView: () => {},
  setScriptId: () => {},
  scriptId: 123,
  sectionId: 2,
  currentView: ViewType.SUMMARY,
  scriptData: {
    id: 123,
    path: '/scripts/myscript',
    lessons: [
      {
        id: 456,
        levels: [{id: '789'}],
      },
    ],
    csf: true,
    hasStandards: true,
  },
  isLoadingProgress: false,
  showStandardsIntroDialog: false,
};

describe('SectionProgress', () => {
  let analyticsSpy;
  beforeEach(() => {
    analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent');
    loadUnitProgress.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setUp = (overrideProps = {}) => {
    return shallow(
      <UnconnectedSectionProgress {...DEFAULT_PROPS} {...overrideProps} />
    );
  };

  it('loading data shows loading icon', async () => {
    const wrapper = setUp({isLoadingProgress: true});
    await setTimeout(() => {}, 50);
    expect(wrapper.find('#uitest-spinner').exists()).toEqual(true);
  });

  it('loading data while loadUnitProgress is in progress', async () => {
    loadUnitProgress.mockImplementation(() => new Promise(() => {}));
    const wrapper = setUp();
    await setTimeout(() => {}, 50);
    expect(wrapper.find('#uitest-spinner').exists()).toEqual(true);
  });

  it('done loading data does not show loading icon', async () => {
    const wrapper = setUp();
    await setTimeout(() => {}, 50);

    expect(wrapper.find('#uitest-spinner').exists()).toEqual(false);
  });

  it('renders ProgressTableView for detail and summary view only', async () => {
    let wrapper = setUp({currentView: ViewType.DETAIL});
    await setTimeout(() => {}, 50);
    expect(wrapper.find(ProgressTableView)).toHaveLength(1);

    wrapper = setUp({currentView: ViewType.SUMMARY});
    await setTimeout(() => {}, 50);
    expect(wrapper.find(ProgressTableView)).toHaveLength(1);

    wrapper = setUp({currentView: ViewType.STANDARDS});
    await setTimeout(() => {}, 50);
    expect(wrapper.find(ProgressTableView)).toHaveLength(0);
  });

  it('passes currentView to ProgressTableView', async () => {
    const wrapper = setUp({currentView: ViewType.DETAIL});
    await setTimeout(() => {}, 50);
    expect(wrapper.find(ProgressTableView).props().currentView).toEqual(
      ViewType.DETAIL
    );
  });

  it('shows standards view', async () => {
    const wrapper = setUp({currentView: ViewType.STANDARDS});
    await setTimeout(() => {}, 50);
    expect(wrapper.find('#uitest-standards-view').exists()).toEqual(true);
  });

  it('sends Amplitude progress event when onChangeScript is called', async () => {
    const wrapper = setUp({currentView: ViewType.DETAIL});
    await setTimeout(() => {}, 50);

    wrapper.instance().onChangeScript(123);
    expect(analyticsSpy).toHaveBeenCalled();

    expect(analyticsSpy.mock.calls[0][0]).toEqual(
      'Section Progress Unit Changed'
    );
  });
});
