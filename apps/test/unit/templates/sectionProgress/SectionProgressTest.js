import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionProgress} from '@cdo/apps/templates/sectionProgress/SectionProgress';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sinon from 'sinon';
import experiments from '@cdo/apps/util/experiments';

const studentData = [
  {id: 1, name: 'studentb'},
  {id: 3, name: 'studentc'},
  {id: 0, name: 'studenta'}
];

describe('SectionProgress', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      setLessonOfInterest: () => {},
      loadScript: () => {},
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
            levels: [{id: 789}]
          }
        ],
        excludeCsfColumnInLegend: false
      },
      isLoadingProgress: false,
      scriptFriendlyName: 'My Script',
      showStandardsIntroDialog: false
    };
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

  it('summary view shows summary view and legend', () => {
    const wrapper = shallow(<UnconnectedSectionProgress {...DEFAULT_PROPS} />);
    expect(wrapper.find('#uitest-summary-view').exists()).to.be.true;
  });

  it('detail view shows detail view and legend', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgress
        {...DEFAULT_PROPS}
        currentView={ViewType.DETAIL}
      />
    );
    expect(wrapper.find('#uitest-detail-view').exists()).to.be.true;
  });

  it('standards view shows standards view and legend', () => {
    sinon.stub(experiments, 'isEnabled').returns(true);
    const wrapper = shallow(
      <UnconnectedSectionProgress
        {...DEFAULT_PROPS}
        currentView={ViewType.STANDARDS}
      />
    );
    expect(wrapper.find('#uitest-standards-view').exists()).to.be.true;
    experiments.isEnabled.restore();
  });
});
