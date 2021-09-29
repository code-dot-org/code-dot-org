import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedStandardsReport as StandardsReport} from '@cdo/apps/templates/sectionProgress/standards/StandardsReport';
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';
import * as progressLoader from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import sinon from 'sinon';

describe('StandardsReport', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    sinon.stub(progressLoader, 'loadScriptProgress');
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
      section: {
        id: 6,
        script: {
          id: 1163,
          name: 'express-2019',
          project_sharing: true
        },
        students: [],
        lessonExtras: false
      },
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//localhost-studio.code.org:3000/s/express-2019',
        lessons: []
      },
      scriptFriendlyName: 'Express Course (2019)'
    };
  });

  afterEach(() => {
    restoreOnWindow('opener');
    progressLoader.loadScriptProgress.restore();
  });

  it('report shows print buttons', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!'
      }
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('PrintReportButton')).to.have.lengthOf(2);
  });

  it('report shows StandardsReportHeader', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!'
      }
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('StandardsReportHeader')).to.have.lengthOf(1);
  });

  it('report shows StandardsReportCurrentCourseInfo', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!'
      }
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('StandardsReportCurrentCourseInfo')).to.have.lengthOf(
      1
    );
  });

  it('report shows teacher comment if one exists', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'I love my class they are wonderful'
      }
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.contains('Teacher comments')).to.equal(true);
    expect(wrapper.contains('I love my class they are wonderful')).to.equal(
      true
    );
  });

  it('report does not show teacher comment section if there is no comment', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: null
      }
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.contains('Teacher comments')).to.equal(false);
  });

  it('report shows StandardsProgressTable', () => {
    replaceOnWindow('opener', {
      teacherDashboardStoreInformation: {
        scriptId: 1,
        teacherComment: 'Comment!'
      }
    });
    const wrapper = shallow(<StandardsReport {...DEFAULT_PROPS} />);
    // componentDidMount resets the value of DEFAULT_PROPS but we have to force
    // the wrapper to reset the props
    wrapper.setProps(DEFAULT_PROPS);
    expect(wrapper.find('Connect(StandardsProgressTable)')).to.have.lengthOf(1);
  });
});
