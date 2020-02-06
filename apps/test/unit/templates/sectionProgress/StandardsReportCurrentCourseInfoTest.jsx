import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StandardsReportCurrentCourseInfo from '@cdo/apps/templates/sectionProgress/standards/StandardsReportCurrentCourseInfo';

describe('StandardsReportCurrentCourseInfo', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
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
      scriptFriendlyName: 'Express Course (2019)',
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//localhost-studio.code.org:3000/s/express-2019',
        stages: []
      },
      scriptDescription: 'This script teaches things',
      numStudentsInSection: 15,
      numLessonsCompleted: 5,
      numLessonsInUnit: 10
    };
  });

  it('report shows correct course information', () => {
    const wrapper = shallow(
      <StandardsReportCurrentCourseInfo {...DEFAULT_PROPS} />
    );
    expect(wrapper.contains('Express Course (2019)')).to.equal(true);
    expect(wrapper.contains('This script teaches things')).to.equal(true);
  });
});
