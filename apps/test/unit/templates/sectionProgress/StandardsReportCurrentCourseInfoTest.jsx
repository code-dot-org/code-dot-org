import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import StandardsReportCurrentCourseInfo from '@cdo/apps/templates/sectionProgress/standards/StandardsReportCurrentCourseInfo';

describe('StandardsReportCurrentCourseInfo', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      sectionId: 6,
      scriptFriendlyName: 'Express Course (2019)',
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//studio.code.org.localhost:3000/s/express-2019',
        lessons: [],
      },
      unitDescription: 'This script teaches things',
      numStudentsInSection: 15,
      numLessonsCompleted: 5,
      numLessonsInUnit: 10,
    };
  });

  it('report shows correct course information', () => {
    const wrapper = shallow(
      <StandardsReportCurrentCourseInfo {...DEFAULT_PROPS} />
    );
    expect(wrapper.contains('Express Course (2019)')).toBe(true);
    expect(wrapper.contains('This script teaches things')).toBe(true);
  });
});
