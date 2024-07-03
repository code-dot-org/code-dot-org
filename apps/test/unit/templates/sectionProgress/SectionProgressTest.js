import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import {UnconnectedSectionProgress} from '@cdo/apps/templates/sectionProgress/SectionProgress';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';

import {assert} from '../../../util/reconfiguredChai';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'},
];

describe('SectionProgress', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    jest.spyOn(progressLoader, 'loadUnitProgress').mockClear().mockImplementation();
    DEFAULT_PROPS = {
      setLessonOfInterest: () => {},
      setCurrentView: () => {},
      setScriptId: () => {},
      scriptId: 1,
      section: {
        id: 2,
        script: {id: 123},
        students: studentData,
      },
      coursesWithProgress: [],
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
      scriptFriendlyName: 'My Script',
      showStandardsIntroDialog: false,
      studentLastUpdateByUnit: {
        1: Date.now(),
      },
    };
  });

  afterEach(() => {
    progressLoader.loadUnitProgress.mockRestore();
  });

  const setUp = (overrideProps = {}) => {
    return shallow(
      <UnconnectedSectionProgress {...DEFAULT_PROPS} {...overrideProps} />
    );
  };

  it('loading data shows loading icon', () => {
    const wrapper = setUp({isLoadingProgress: true});
    expect(wrapper.find('#uitest-spinner').exists()).toBe(true);
  });

  it('done loading data does not show loading icon', () => {
    const wrapper = setUp();
    expect(wrapper.find('#uitest-spinner').exists()).toBe(false);
  });

  it('renders ProgressTableView for detail and summary view only', () => {
    let wrapper = setUp({currentView: ViewType.DETAIL});
    expect(wrapper.find(ProgressTableView)).toHaveLength(1);

    wrapper = setUp({currentView: ViewType.SUMMARY});
    expect(wrapper.find(ProgressTableView)).toHaveLength(1);

    wrapper = setUp({currentView: ViewType.STANDARDS});
    expect(wrapper.find(ProgressTableView)).toHaveLength(0);
  });

  it('passes currentView to ProgressTableView', () => {
    const wrapper = setUp({currentView: ViewType.DETAIL});
    expect(wrapper.find(ProgressTableView).props().currentView).toBe(ViewType.DETAIL);
  });

  it('shows standards view', () => {
    const wrapper = setUp({currentView: ViewType.STANDARDS});
    expect(wrapper.find('#uitest-standards-view').exists()).toBe(true);
  });

  it('sends Amplitude progress event when onChangeScript is called', () => {
    const wrapper = setUp({currentView: ViewType.DETAIL});
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    wrapper.instance().onChangeScript(123);
    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    assert.equal(
      analyticsSpy.mock.calls[0].firstArg,
      'Section Progress Unit Changed'
    );

    analyticsSpy.mockRestore();
  });
});
