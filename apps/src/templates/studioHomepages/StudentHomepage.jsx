import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import RecentCourses from './RecentCourses';
import StudentSections from './StudentSections';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import StudentFeedbackNotification from '@cdo/apps/templates/feedback/StudentFeedbackNotification';
import experiments from '@cdo/apps/util/experiments';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from '@cdo/locale';
import $ from 'jquery';

export default class StudentHomepage extends Component {
  static propTypes = {
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    sections: shapes.sections,
    canViewAdvancedTools: PropTypes.bool
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#flashes')
      .appendTo(ReactDOM.findDOMNode(this.refs.flashes))
      .show();
  }

  render() {
    const {courses, sections, topCourse} = this.props;
    const {canViewAdvancedTools} = this.props;

    return (
      <div>
        <HeaderBanner headingText={i18n.homepageHeading()} short={true} />
        <ProtectedStatefulDiv ref="flashes" />
        {experiments.isEnabled(experiments.FEEDBACK_NOTIFICATION) && (
          <StudentFeedbackNotification
            numFeedbackLevels="2"
            linkToFeedbackOverview="/"
          />
        )}
        <RecentCourses
          courses={courses}
          topCourse={topCourse}
          isTeacher={false}
        />
        <ProjectWidgetWithData
          canViewFullList={true}
          canViewAdvancedTools={canViewAdvancedTools}
        />
        <StudentSections initialSections={sections} />
      </div>
    );
  }
}
