import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionProgress} from '@cdo/apps/templates/sectionProgress/SectionProgress';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import sinon from 'sinon';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import ProgressTableContainer from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableContainer';

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
        stages: [
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

  it('loading data shows loading icon', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgress {...DEFAULT_PROPS} isLoadingProgress={true} />
    );
    expect(wrapper.find('#uitest-spinner').exists()).to.be.true;
  });

  it('done loading data does not show loading icon', () => {
    const wrapper = shallow(<UnconnectedSectionProgress {...DEFAULT_PROPS} />);
    expect(wrapper.find('#uitest-spinner').exists()).to.be.false;
  });

  it('passes currentView to ProgressTableContainer', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgress
        {...DEFAULT_PROPS}
        currentView={ViewType.DETAIL}
      />
    );
    expect(wrapper.find(ProgressTableContainer).props().currentView).to.equal(
      ViewType.DETAIL
    );
  });

  it('shows standards view', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgress
        {...DEFAULT_PROPS}
        currentView={ViewType.STANDARDS}
      />
    );
    expect(wrapper.find('#uitest-standards-view').exists()).to.be.true;
  });
});
