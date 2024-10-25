import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import {UnconnectedStandardsReport as StandardsReport} from '@cdo/apps/templates/sectionProgress/standards/StandardsReport';

import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';

describe('StandardsReport', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    jest
      .spyOn(progressLoader, 'loadUnitProgress')
      .mockClear()
      .mockImplementation();
    DEFAULT_PROPS = {
      scriptId: 2,
      teacherName: 'Awesome Teacher',
      sectionName: 'Great Section',
      teacherComment: null,
      unitDescription: 'This script teaches things',
      numStudentsInSection: 15,
      numLessonsCompleted: 5,
      numLessonsInUnit: 10,
      setTeacherCommentForReport: comment => {
        DEFAULT_PROPS.teacherComment = comment;
      },
      setScriptId: scriptId => {
        DEFAULT_PROPS.scriptId = scriptId;
      },
      sectionId: 6,
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//studio.code.org.localhost:3000/s/express-2019',
        lessons: [],
      },
      scriptFriendlyName: 'Express Course (2019)',
    };
  });

  afterEach(() => {
    restoreOnWindow('opener');
    progressLoader.loadUnitProgress.mockRestore();
  });

  it('report shows print buttons', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!',
      },
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('PrintReportButton')).toHaveLength(2);
  });

  it('report shows StandardsReportHeader', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!',
      },
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('StandardsReportHeader')).toHaveLength(1);
  });

  it('report shows StandardsReportCurrentCourseInfo', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!',
      },
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('StandardsReportCurrentCourseInfo')).toHaveLength(1);
  });

  it('report shows teacher comment if one exists', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'I love my class they are wonderful',
      },
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.contains('Teacher comments')).toBe(true);
    expect(wrapper.contains('I love my class they are wonderful')).toBe(true);
  });

  it('report does not show teacher comment section if there is no comment', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: null,
      },
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.contains('Teacher comments')).toBe(false);
  });

  it('report shows StandardsProgressTable', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!',
      },
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('Connect(StandardsProgressTable)')).toHaveLength(1);
  });
});
