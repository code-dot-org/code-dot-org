import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import {UnconnectedSectionProgress} from '@cdo/apps/templates/sectionProgress/SectionProgress';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';

import {expect, assert} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'},
];

describe('SectionProgress', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    sinon.stub(progressLoader, 'loadUnitProgress');
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
    progressLoader.loadUnitProgress.restore();
  });

  const setUp = (overrideProps = {}) => {
    return shallow(
      <UnconnectedSectionProgress {...DEFAULT_PROPS} {...overrideProps} />
    );
  };

  it('loading data shows loading icon', () => {
    const wrapper = setUp({isLoadingProgress: true});
    expect(wrapper.find('#uitest-spinner').exists()).to.be.true;
  });

  it('done loading data does not show loading icon', () => {
    const wrapper = setUp();
    expect(wrapper.find('#uitest-spinner').exists()).to.be.false;
  });

  it('renders ProgressTableView for detail and summary view only', () => {
    let wrapper = setUp({currentView: ViewType.DETAIL});
    expect(wrapper.find(ProgressTableView)).to.have.length(1);

    wrapper = setUp({currentView: ViewType.SUMMARY});
    expect(wrapper.find(ProgressTableView)).to.have.length(1);

    wrapper = setUp({currentView: ViewType.STANDARDS});
    expect(wrapper.find(ProgressTableView)).to.have.length(0);
  });

  it('passes currentView to ProgressTableView', () => {
    const wrapper = setUp({currentView: ViewType.DETAIL});
    expect(wrapper.find(ProgressTableView).props().currentView).to.equal(
      ViewType.DETAIL
    );
  });

  it('shows standards view', () => {
    const wrapper = setUp({currentView: ViewType.STANDARDS});
    expect(wrapper.find('#uitest-standards-view').exists()).to.be.true;
  });

  it('sends Amplitude progress event when onChangeScript is called', () => {
    const wrapper = setUp({currentView: ViewType.DETAIL});
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    wrapper.instance().onChangeScript(123);
    expect(analyticsSpy).to.be.calledOnce;
    assert.equal(
      analyticsSpy.getCall(0).firstArg,
      'Section Progress Unit Changed'
    );

    analyticsSpy.restore();
  });
});
