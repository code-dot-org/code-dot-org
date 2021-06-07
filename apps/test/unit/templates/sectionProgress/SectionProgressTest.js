import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionProgress} from '@cdo/apps/templates/sectionProgress/SectionProgress';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import sinon from 'sinon';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'}
];

describe('SectionProgress', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    sinon.stub(progressLoader, 'loadScriptProgress');
    DEFAULT_PROPS = {
      setLessonOfInterest: () => {},
      setCurrentView: () => {},
      setScriptId: () => {},
      scriptId: 1,
      section: {
        id: 2,
        script: {id: 123},
        students: studentData
      },
      validScripts: [],
      currentView: ViewType.SUMMARY,
      scriptData: {
        id: 123,
        path: '/scripts/myscript',
        lessons: [
          {
            id: 456,
            levels: [{id: '789'}]
          }
        ],
        csf: true,
        hasStandards: true
      },
      isLoadingProgress: false,
      scriptFriendlyName: 'My Script',
      showStandardsIntroDialog: false,
      studentLastUpdateByScript: {
        1: Date.now()
      }
    };
  });

  afterEach(() => {
    progressLoader.loadScriptProgress.restore();
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
});
