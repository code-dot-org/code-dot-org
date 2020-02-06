import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedStandardsReport as StandardsReport} from '@cdo/apps/templates/sectionProgress/standards/StandardsReport';

describe('StandardsReport', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      scriptId: 1,
      loadScript: () => {},
      teacherName: 'Awesome Teacher',
      sectionName: 'Great Section',
      teacherComment: 'I love my class they are wonderful',
      scriptDescription: 'This script teaches things',
      numStudentsInSection: 15,
      numLessonsCompleted: 5,
      numLessonsInUnit: 10,
      getStandardsCoveredForScript: () => {},
      section: {
        id: 6,
        script: {
          id: 1163,
          name: 'express-2019',
          project_sharing: true
        },
        students: [],
        stageExtras: false
      },
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//localhost-studio.code.org:3000/s/express-2019',
        stages: []
      },
      scriptFriendlyName: 'Express Course (2019)'
    };
  });

  it('report shows print buttons', () => {
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    expect(wrapper.find('Button')).to.have.lengthOf(2);
  });

  it('report shows StandardsReportHeader', () => {
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    expect(wrapper.find('StandardsReportHeader')).to.have.lengthOf(1);
  });

  it('report shows StandardsReportCurrentCourseInfo', () => {
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    expect(wrapper.find('StandardsReportCurrentCourseInfo')).to.have.lengthOf(
      1
    );
  });

  it('report shows teacher comment if one exists', () => {
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    expect(wrapper.contains('Teacher comments')).to.equal(true);
    expect(wrapper.contains('I love my class they are wonderful')).to.equal(
      true
    );
  });

  it('report does not show teacher comment section if there is no comment', () => {
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    expect(wrapper.contains('Teacher comments')).to.equal(false);
  });

  it('report shows StandardsProgressTable', () => {
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    expect(wrapper.find('Connect(StandardsProgressTable)')).to.have.lengthOf(1);
  });
});
